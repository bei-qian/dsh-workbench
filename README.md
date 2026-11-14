# dsh-workbench（工作台）

把**正在运行的工作区**（有会话/子智能体在跑的）置顶到侧边栏工作区列表上方，让活跃工作区始终在视线内。基于 DeepSeek Harness 的插件（bundle）。

- 包名：`@local/dsh-workbench`
- 形态：DSH bundle（Host-only 排序逻辑 + 一个极小 Client 占位标记）
- BMad 规划与票单：`../_bmad-output/initiative-workbench/`

## 工作方式

- 侧边栏工作区分组顺序 = Host durable workspace registry 顺序。
- 插件监听 Host 事件 `api-session/status`、`api-session/added`、`api-session/removed` 维护“运行中会话集合”。
- 通过 `workspaceRegistry.insertBefore` 把包含运行中会话的工作区**稳定置顶**（组内相对顺序不变）；其余按原顺序跟在后面。
- 卸载/禁用时按启用时基线**尽力恢复**（启用后新增的工作区追加末尾）。
- `cordis.patch.yml` 的 `config.enabled`（默认 `true`）可关闭置顶。

## 限制

- 不改内置 `sidebar.workspaces` 槽，不修改内置 UI 源码。
- **“未分组”桶无法置顶**（不是 registry 实体，顺序为浏览器本地状态）。
- 不调整工作区内会话顺序；内置「手动 / 最近更新」会话排序不受影响。
- 启用前已在运行、且无新状态事件的会话，需等下一次状态变化才纳入。
- 置顶会改变工作区“手动顺序”（持久化），卸载按上条恢复；重启后再启用的基线为当时顺序。

## 目录

- `index.js` —— Host 插件（排序逻辑）
- `client.js` / `locale/*` / `icon.svg` / `docs/DETAIL.md` —— Client 占位标记与插件展示元数据
- `tests/workbench.test.ts` —— 纯排序逻辑单元测试（vitest）
- `tests/ACCEPTANCE.md` —— 真实 GUI 端到端验收清单
- `vitest.config.ts` / `.github/workflows/ci.yml` —— 测试与 CI

## 开发 / 测试

- `pnpm test`（vitest；需先安装依赖）。
- CI：GitHub Actions 安装依赖并运行测试。
- 安装：Plugins > Add plugin 选择本目录（或开发流程本地安装）。Host 模块更新后需重启 DSH 才会加载新代码。
