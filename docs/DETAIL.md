# DSH Workbench（工作台）

把**正在运行的工作区**（有会话/子智能体在跑的）置顶到侧边栏工作区列表上方，让活跃工作区始终在视线内。

## 工作方式

- 侧边栏的工作区分组顺序来自 Host 的 durable workspace registry 顺序。
- 本插件是 **Host-only**：监听 Host 事件 `api-session/status`（以及 `api-session/added` / `removed`）维护“运行中会话集合”，把包含运行中会话的工作区通过 `workspaceRegistry.insertBefore` 稳定移动到最前；其余保持原有相对顺序。
- **不替换、不修改内置侧边栏 UI**（不改 `sidebar.workspaces` 槽）。
- 插件卸载/禁用时，尽力恢复启用时的工作区顺序（启用后新增的工作区追加在末尾）。
- 通过 `cordis.patch.yml` 的 `config.enabled`（默认 `true`）可关闭置顶行为。

## 限制

- **不会**调整工作区内部会话顺序；内置「手动 / 最近更新」对会话的排序不受影响。
- **“未分组”桶无法置顶**：未分组不是 registry 中的 Workspace 实体，其顺序是浏览器本地状态，插件无法通过 registry 调整（v1 限制）。
- 运行/停止以 Host 的 `api-session/status` 为准；插件启用前已在运行、且未再触发状态变化的会话，需等下一次状态事件才会纳入。
- 置顶通过持久化 registry 顺序实现：启用期间它会改变工作区的“手动顺序”；卸载后按上面规则恢复（重启后再启用的基线为当时顺序）。
- 客户端半仍注册一个极小的占位标记（`conversation.composer.dock` 的小圆点）；它不参与排序逻辑。

## 开发

- 测试：`pnpm test`（vitest）。
- CI：`.github/workflows/ci.yml`（GitHub Actions）。
- 规划与票单：`../_bmad-output/initiative-workbench/`。
