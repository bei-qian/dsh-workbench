# 更新日志

> 语言：[English](CHANGELOG.md) | 简体中文

本项目的所有重要变更都记录在此。格式遵循
[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 变更

- 以公开 scoped 包 `@beiqian/dsh-workbench` 发布（原 `@local/dsh-workbench`）：移除 `private`，
  增加 `publishConfig.access`、`repository`/`homepage`/`bugs`/`keywords`/`author` 与 `engines.dsh`。
- bundle patch 的 `name` 与 client factory id 已同步为新包名。

## [0.1.0] - 2026-11-14

### 新增

- 仅 Host 端的 DSH bundle `@beiqian/dsh-workbench`：重排持久化的工作区注册表顺序，
  使有运行中会话的工作区排在侧边栏最前。
- 基于 Host 事件 `api-session/status`、`api-session/added`、`api-session/removed`
  的实时更新。
- 配置开关 `config.enabled`（默认 `true`），可关闭置顶。
- 卸载/禁用时按启用时基线尽力恢复工作区顺序。
- 在 `conversation.composer.dock` 注册一个极小 Client 占位标记，用于验证安装。
- 纯排序逻辑的 vitest 单元测试，以及 GitHub Actions CI。
- 文档：README、插件详情（`docs/DETAIL.md`）与端到端验收清单。

### 已知限制

- “未分组”桶无法置顶（它不是注册表中的工作区实体）。
- 工作区内部会话顺序不变；内置「手动 / 最近更新」排序仍然生效。
- 置顶通过注册表顺序持久化，卸载时的恢复为尽力而为。
- Host 模块变更需重启 DSH 才生效。
