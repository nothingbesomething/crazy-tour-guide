crazy tour guide v1.0
一个帮你规划日本旅行的小网站。输入城市名，AI 会整理值得玩的地方、交通方式、大概预算和建议游玩天数。

网站支持日语和英语，也能自己修改内容、写旅行备注。富士山用了像素风格，底部的 🎲 可以随机抽一个旅行小任务。

怎么运行
安装 Node.js 22.9 或以上版本，在项目文件夹里运行：

npm run dev

然后打开 http://localhost:8765/。

AI 搜索需要配置 Gemini API 密钥，放在项目里的 .env.gemini 文件中。不要把密钥上传到 GitHub。

只想看看页面的话，直接打开 Japan-travel-preview.html 就行。AI 给出的预算和行程仅供参考，出发前记得确认实际信息。

English
A small website to help you plan a trip around Japan. Enter a city name, and AI puts together places to visit, transport options, a rough budget, and how long to stay.

The site supports Japanese and English. You can edit the guide and add your own travel notes. There’s also pixel-art Mount Fuji and a 🎲 button that gives you a random travel mission.

How to run
Install Node.js 22.9 or later, then run this in the project folder:

npm run dev

Open http://localhost:8765/ in your browser.

AI search needs a Gemini API key saved in .env.gemini. Don’t upload your key to GitHub.

To preview the design, just open Japan-travel-preview.html. AI budgets and itineraries are rough suggestions, so check the details before your trip.
