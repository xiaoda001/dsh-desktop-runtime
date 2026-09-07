# dsh-desktop-runtime

独立构建和发布 `@deepseek-ai/dsh` runtime，供 `dsh-desktop` 下载、校验并热切换。

## 版本策略

`package.json` 中的 `dependencies.@deepseek-ai/dsh` 是已发布 runtime 的记录版本。
GitHub Actions 每天检查 npm 的 latest 版本：

1. 版本相同：不执行构建和发布。
2. 版本不同：更新 `package.json` 和 `pnpm-lock.yaml`。
3. 在 Windows x64、macOS arm64、Linux x64 上构建 runtime 压缩包。
4. 发布 `dsh-runtime-<version>` GitHub Release。

每个平台同时发布一个 manifest：

```text
latest-win32-x64.json
latest-darwin-arm64.json
latest-linux-x64.json
```

桌面端可使用以下地址配置 `DSH_DESKTOP_RUNTIME_MANIFEST_URL`：

```text
https://github.com/xiaoda001/dsh-desktop-runtime/releases/latest/download/latest-win32-x64.json
```

## 本地构建

```bash
pnpm install
pnpm runtime:build
```

也可以使用 `DSH_VERSION` 覆盖 `package.json` 中记录的版本：

```bash
DSH_VERSION=0.1.2 pnpm runtime:build
```
