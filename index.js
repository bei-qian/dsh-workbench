/**
 * dsh-workbench — running-workspace pinning (Host-only).
 *
 * The sidebar renders workspace groups in the durable registry order, so this
 * plugin keeps running workspaces first by reordering the registry through
 * `workspaceRegistry.insertBefore`. Running state comes from the Host
 * `api-session/status` event (and `api-session/added` / `api-session/removed`
 * for membership), so no Client slot is touched and the shipped sidebar is not
 * replaced. The order observed at activation is restored on unload.
 */

/** Cordis plugin identity. */
export const name = 'workbench';
/** The registry this plugin reorders. */
export const inject = ['workspaceRegistry'];

/**
 * Compare two workspace id orders for equality.
 * @param {readonly string[]} a - first order.
 * @param {readonly string[]} b - second order.
 * @returns {boolean} true when both orders are element-wise identical.
 */
export function sameOrder(a, b) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * Compute the running-first partition while preserving each side's order.
 * A workspace is "running" when at least one of its accounted sessions is in
 * the running set.
 * @param {ReadonlyArray<{ id: string, sessionIds: readonly string[] }>} workspaces - registry projection in durable order.
 * @param {ReadonlySet<string> | readonly string[]} runningSessionIds - sessions whose agent reports running.
 * @returns {string[]} target workspace id order: running first, then idle.
 */
export function runningFirstOrder(workspaces, runningSessionIds) {
  const running = runningSessionIds instanceof Set ? runningSessionIds : new Set(runningSessionIds);
  const active = [];
  const idle = [];
  for (const workspace of workspaces) {
    const isRunning = workspace.sessionIds.some((sessionId) => running.has(sessionId));
    (isRunning ? active : idle).push(workspace.id);
  }
  return [...active, ...idle];
}

/**
 * Move the durable order toward `target` using DOM-insertBefore-like registry
 * moves, rewriting only the leading segment that differs.
 * @param {{ list: () => Array<{ id: string }>, insertBefore: (id: string, beforeId?: string) => Promise<unknown> }} registry - durable registry face.
 * @param {readonly string[]} target - desired workspace id order.
 * @returns {Promise<void>} resolves after the order matches `target`.
 */
export async function applyOrder(registry, target) {
  // Anchor from the tail: placing target[i-1] before target[i] for i from the
  // end builds the target chain without disturbing already-placed successors.
  for (let index = target.length - 1; index >= 1; index -= 1) {
    const current = registry.list().map((workspace) => workspace.id);
    if (!current.includes(target[index - 1]) || !current.includes(target[index])) continue;
    await registry.insertBefore(target[index - 1], target[index]);
  }
}

/**
 * Best-effort restoration of the activation-time order on unload. Workspaces
 * added since activation are appended after the restored ones.
 * @param {{ list: () => Array<{ id: string }>, insertBefore: (id: string, beforeId?: string) => Promise<unknown> }} registry - durable registry face.
 * @param {readonly string[] | null} baseline - order captured at activation.
 * @returns {Promise<void>} resolves after a best-effort restore.
 */
export async function restoreOrder(registry, baseline) {
  if (baseline === null) return;
  try {
    const current = registry.list().map((workspace) => workspace.id);
    const currentSet = new Set(current);
    const baselineSet = new Set(baseline);
    const target = [
      ...baseline.filter((id) => currentSet.has(id)),
      ...current.filter((id) => !baselineSet.has(id)),
    ];
    if (sameOrder(current, target)) return;
    await applyOrder(registry, target);
  } catch {
    /* unload is best-effort; a failed restore must not block disposal */
  }
}

/**
 * Register the running-workspace pinning behavior.
 * @param {any} ctx - Cordis Host context.
 * @param {{ enabled?: boolean } | undefined} config - row config; `enabled` defaults to true.
 * @returns {void}
 */
export function apply(ctx, config) {
  const enabled = !(config && config.enabled === false);
  if (!enabled) return;

  const registry = ctx.workspaceRegistry;
  /** Session ids whose agent currently reports running. */
  const running = new Set();
  /** Registry order captured at activation, restored on unload. */
  let baseline = null;
  /** Coalescing timer for bursts of status changes. */
  let timer = null;
  /** Guard against overlapping reorder passes. */
  let reordering = false;

  /** Recompute and apply the running-first order once. */
  async function reorder() {
    if (reordering) return;
    reordering = true;
    try {
      const workspaces = registry.list();
      if (baseline === null) baseline = workspaces.map((workspace) => workspace.id);
      const target = runningFirstOrder(workspaces, running);
      if (sameOrder(workspaces.map((workspace) => workspace.id), target)) return;
      await applyOrder(registry, target);
    } catch (error) {
      if (typeof ctx.logger?.warn === 'function') ctx.logger.warn('dsh-workbench reorder failed', error);
    } finally {
      reordering = false;
    }
  }

  /** Schedule one reorder after a short debounce. */
  function schedule() {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      void reorder();
    }, 60);
  }

  ctx.on('api-session/status', (sessionId, isRunning) => {
    if (isRunning) running.add(sessionId);
    else running.delete(sessionId);
    schedule();
  });

  ctx.on('api-session/added', (summary) => {
    if (summary && summary.running === true) running.add(summary.id);
    schedule();
  });

  ctx.on('api-session/removed', (sessionId) => {
    running.delete(sessionId);
    schedule();
  });

  ctx.effect(() => {
    schedule();
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      void restoreOrder(registry, baseline);
    };
  });
}
