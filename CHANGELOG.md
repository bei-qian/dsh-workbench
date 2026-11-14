# Changelog

> Language: English | [简体中文](CHANGELOG.zh-CN.md)

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-11-14

### Added

- Host-only DSH bundle `@local/dsh-workbench`: reorders the durable workspace
  registry so workspaces with running sessions lead the sidebar.
- Real-time updates driven by Host `api-session/status`, `api-session/added`, and
  `api-session/removed` events.
- Config toggle `config.enabled` (default `true`) to disable pinning.
- Best-effort restoration of the activation-time workspace order on unload/disable.
- Minimal Client marker in `conversation.composer.dock` for install verification.
- Vitest unit tests for the pure ordering helpers, plus GitHub Actions CI.
- Documentation: README, plugin detail (`docs/DETAIL.md`), and an E2E acceptance checklist.

### Known limitations

- The "Ungrouped" bucket cannot be pinned (it is not a registry workspace entity).
- Session order inside a workspace is unchanged; built-in Manual / Last updated
  sorting still applies.
- Pinning persists through the registry order; restore on unload is best-effort.
- Host module changes require a DSH restart to take effect.
