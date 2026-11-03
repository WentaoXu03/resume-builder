# Sites 部署

`hosting.json` 保存此项目的 Sites ID，后续发布应复用该 ID。

站点地址：https://resume-builder-22003-20261102.wentaoxu-nied-03.chatgpt.site

Sites 的独立部署源码位于 `../.sites-release/resume-builder/`，并同步到该站点的源代码仓库。它使用 Sites 官方 Vinext / Cloudflare Workers 运行时，保留应用的编辑、预览、导出和 AI 路由。主仓库继续使用 Next.js；根目录的 `npm run build` 不是 Sites 部署构建命令。

更新站点时，先通过 Sites 的源代码工作流打开该站点，在其返回的 checkout 中同步业务代码、保留 Sites 运行时配置，再执行类型检查、构建、验证和发布。不要再次创建站点，也不要把原仓库的 Git 历史或 `.ai/` 归档复制进部署源码。

部署副本中的必要适配：

- 使用 Vinext 构建，并保留官方 `sites()` Vite 集成和 Worker 入口。
- `src/` 保持与主仓库一致，功能修改同时同步到部署副本。
- 应用和运行时分别用 `tsconfig.app.json`、`tsconfig.hosting.json` 检查类型，避免 Workers 全局类型影响浏览器应用代码。
- `GOOGLE_AI_API_KEY` 通过 Sites 运行时 secret 配置；`GOOGLE_AI_MODEL` 可选，默认 `gemini-2.5-flash`。配置后重新部署已保存版本使其生效。

新站点默认仅所有者可访问。简历仍保存在当前浏览器 localStorage；本地开发地址的数据不会自动迁移到线上域名，可使用 JSON 导出/导入迁移。
