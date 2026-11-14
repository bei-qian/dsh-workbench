import { describe, it, expect } from 'vitest';
import { runningFirstOrder, sameOrder, applyOrder, restoreOrder } from '../index.js';

/** Minimal workspace projection for tests. */
function workspace(id, sessionIds) {
  return { id, sessionIds };
}

/** In-memory registry stub that mirrors insertBefore semantics. */
function fakeRegistry(ids) {
  let order = [...ids];
  return {
    list() {
      return order.map((id) => ({ id }));
    },
    async insertBefore(id, beforeId) {
      if (!order.includes(id)) return order;
      order = order.filter((value) => value !== id);
      if (beforeId === undefined || !order.includes(beforeId)) order.push(id);
      else order.splice(order.indexOf(beforeId), 0, id);
      return order;
    },
  };
}

describe('runningFirstOrder', () => {
  it('moves a running workspace to the front, preserving each side order', () => {
    const workspaces = [workspace('a', ['s1']), workspace('b', ['s2']), workspace('c', ['s3'])];
    expect(runningFirstOrder(workspaces, new Set(['s3']))).toEqual(['c', 'a', 'b']);
  });

  it('keeps the order unchanged when nothing is running', () => {
    const workspaces = [workspace('a', ['s1']), workspace('b', ['s2'])];
    expect(runningFirstOrder(workspaces, new Set())).toEqual(['a', 'b']);
  });

  it('preserves relative order among several running workspaces', () => {
    const workspaces = [workspace('a', ['s1']), workspace('b', ['s2']), workspace('c', ['s3']), workspace('d', ['s4'])];
    expect(runningFirstOrder(workspaces, new Set(['s2', 's4']))).toEqual(['b', 'd', 'a', 'c']);
  });

  it('accepts a plain array of running session ids', () => {
    const workspaces = [workspace('a', ['s1']), workspace('b', ['s2'])];
    expect(runningFirstOrder(workspaces, ['s2'])).toEqual(['b', 'a']);
  });

  it('handles an empty workspace list', () => {
    expect(runningFirstOrder([], new Set())).toEqual([]);
  });
});

describe('applyOrder', () => {
  it('rewrites the durable order to the target order', async () => {
    const registry = fakeRegistry(['a', 'b', 'c']);
    await applyOrder(registry, ['c', 'a', 'b']);
    expect(registry.list().map((workspace) => workspace.id)).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op when the order already matches', async () => {
    const registry = fakeRegistry(['a', 'b', 'c']);
    await applyOrder(registry, ['a', 'b', 'c']);
    expect(registry.list().map((workspace) => workspace.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('restoreOrder', () => {
  it('restores the baseline order and appends new workspaces', async () => {
    const registry = fakeRegistry(['c', 'd', 'a', 'b']);
    await restoreOrder(registry, ['a', 'b']);
    expect(registry.list().map((workspace) => workspace.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('does nothing when there is no baseline', async () => {
    const registry = fakeRegistry(['a', 'b']);
    await restoreOrder(registry, null);
    expect(registry.list().map((workspace) => workspace.id)).toEqual(['a', 'b']);
  });
});

describe('sameOrder', () => {
  it('detects equality and difference', () => {
    expect(sameOrder(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(sameOrder(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(sameOrder(['a'], ['a', 'b'])).toBe(false);
  });
});
