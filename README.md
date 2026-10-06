# crazy tour guide v1.0

一个帮你规划日本旅行的小网站。输入城市名，AI 会整理值得玩的地方、交通方式、大概预算和建议游玩天数。

网站支持日语和英语，也能自己修改内容、写旅行备注。富士山用了像素风格，底部的 🎲 可以随机抽一个旅行小任务。

## 怎么运行

1. 安装 Node.js 22.9 或以上版本。
2. 下载并解压源码，找到有 `package.json` 的文件夹。
3. 在这个文件夹里打开终端，运行：

    npm run dev

4. 浏览器打开 http://localhost:8765/ 。

终端要保持运行，按 Control + C 可以停止网站。

## 配置 AI 搜索

源码里没有 API 密钥，需要使用你自己的 Gemini 密钥。

用 VS Code 打开项目，在 `package.json` 同一层新建 `.env.gemini` 文件，填入：

    AI_PROVIDER=gemini
    GEMINI_MODEL=gemini-3.8-flash
    GEMINI_API_KEY=替换为你自己的密钥

密钥可以在 https://aistudio.google.com/apikey 获取。

保存后重新运行 `npm run dev`。不要把密钥文件上传到 GitHub。Mac 上如果看不到这个文件，按 Command + Shift + . 显示隐藏文件。

---

## English

A small website to help you plan a trip around Japan. Enter a city name, and AI puts together places to visit, transport options, a rough budget, and how long to stay.

The site supports Japanese and English. You can edit the guide and add your own travel notes. There’s also pixel-art Mount Fuji and a 🎲 button that gives you a random travel mission.

## How to run

1. Install Node.js 22.9 or later.
2. Download and unzip the source code. Find the folder containing `package.json`.
3. Open a terminal in that folder and run:

    npm run dev

4. Open http://localhost:8765/ in your browser.

Keep the terminal running. Press Control + C to stop the server.

## Set up AI search

No API key is included. You’ll need your own Gemini key.

Open the project in VS Code and create `.env.gemini` next to `package.json`:

    AI_PROVIDER=gemini
    GEMINI_MODEL=gemini-3.8-flash
    GEMINI_API_KEY=replace_with_your_own_key

Get a key at https://aistudio.google.com/apikey .

Save the file and restart `npm run dev`. Don’t upload your key file to GitHub. On Mac, press Command + Shift + . to show hidden files.

