# 山海 / SAN KAI — Japan City Guide

基于原地区旅游框架改造的日英双语网站。输入日本城市名后，后端可使用 Gemini 生成参考攻略，或使用 OpenAI 进行联网检索，生成必玩项目、交通方式、日元预算和建议行程。语言切换会使用同一份双语结果，不会重复调用模型。

## 当前交付状态

- 日文／英文界面、城市搜索、自定义文字、下载阅览版已实现。
- 默认京都内容明确标为示例，不是实时 AI 结果。
- 后端 API 已实现并通过 12 项模拟接口测试。
- 当前已选择 Gemini 模式；尚未配置 `GEMINI_API_KEY`，真实 Gemini 调用尚未验证。
- 免费模式不使用 Google 搜索，结果标注为未实时核实的参考攻略，不展示虚构来源。
- 之前的 OpenAI 密钥保留在本地 `.env`，该账户曾返回余额耗尽；Gemini 模式不会自动回退到 OpenAI。
- 原 Sites 项目已保留，在线保存被当前自动审批策略拦截，尚未发布。

## 本地启动

需要 Node.js 22.9 或更新版本，无第三方运行依赖。

1. 在 [Google AI Studio](https://aistudio.google.com/) 创建 Gemini API 密钥，使用有免费额度的项目。
2. 将密钥写入本地 `.env.gemini` 的 `GEMINI_API_KEY=` 后面。该文件已准备好且被忽略，不要将密钥发到聊天或放入前端网页。
3. 运行 `npm run dev`，打开 `http://localhost:8765/`。
4. 输入 `京都`、`Tokyo` 等城市名并提交。

`.env.gemini` 设置 `AI_PROVIDER=gemini` 和 `GEMINI_MODEL=gemini-3.8-flash`。密钥为空时会明确提示未接入，不会调用旧的 OpenAI 密钥。免费额度由 Google 的项目和账户政策决定；本代码不启用付费搜索或修改账单设置。如果指定的 Google 项目已启用付费计费，仍会依该项目计费规则运行。

Gemini 使用官方 Interactions API、JSON Schema 和 `store=false`，不调用搜索工具。输出基于模型知识，价格及时间仅为估计。原 OpenAI 联网分支可用 `AI_PROVIDER=openai` 显式选择。

## 验证与构建

- `npm test`：输入校验、缺少密钥、同源校验、模拟成功结果、预算校验、来源校验、错误返回。
- `npm run build`：生成 `dist/server/index.js`，包含服务端接口和网页资源，可作为 Cloudflare Worker 发布。
- `/api/status`：返回所选服务、是否已配置和是否使用联网模式，不返回密钥。
- `/api/guide`：只接受包含 `city` 的 JSON POST 请求。

后端对城市输入长度、结果字段、金额范围、行程天数、引用来源及超时做校验。OpenAI 联网模式仅显示联网工具实际返回的来源链接；Gemini 模式清空来源并标注未实时搜索。预算按每人、整段行程计算，不包含机票和城市间往返交通。生成结果仍应由用户结合官方信息复核。

自定义文字保留在当前页面；下载得到只读 HTML 快照。语言选择作为设备偏好保存。未增加用户账户或旅行记录存储。

## 文件

- `public/`：网页、样式、双语交互和本地图片。
- `src/api.mjs`：服务端模型接口。
- `server.mjs`：本地预览服务。
- `build.mjs`：部署构建。
- `.openai/hosting.json`：原 Sites 项目标识，未创建新的站点。

## 参考

- [OpenAI Responses API / Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI Web search](https://developers.openai.com/api/docs/guides/tools-web-search)
- [京都市官方旅游指南](https://kyoto.travel/en/)
- [照片：Takashi Miyazaki / Unsplash](https://unsplash.com/photos/chureito-pagoda-and-mount-fuji-overlooking-a-japanese-town-_VCtujeQNSY)

- [Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini API 定价与免费额度](https://ai.google.dev/gemini-api/docs/pricing)
