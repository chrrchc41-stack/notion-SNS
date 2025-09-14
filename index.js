const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("@notionhq/client");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 環境変数
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const PORT = process.env.PORT || 3000;

const notion = new Client({ auth: NOTION_TOKEN });

// 投稿追加
app.post("/add-post", async (req, res) => {
  try {
    const 名前 = req.body["名前"] || "未入力"; // 投稿内容もここに入れる
    const 投稿日付 = req.body["投稿日付"];
    const ステータス = req.body["ステータス"] || "📝アイディア";
    const SNS = req.body["SNS"];
    const カテゴリー = req.body["投稿カテゴリー"];
    const 投稿リンク = req.body["投稿リンク"];
    const 投稿予定日 = req.body["投稿予定日"];

    const properties = {
      "名前": { title: [{ text: { content: 名前 } }] },
      "ステータス": { select: { name: ステータス } }
    };

    if (投稿日付) properties["投稿日付"] = { date: { start: 投稿日付 } };
    if (SNS) properties["SNS"] = { select: { name: SNS } };
    if (カテゴリー) properties["投稿カテゴリー"] = { select: { name: カテゴリー } };
    if (投稿リンク) properties["投稿リンク"] = { url: 投稿リンク };
    if (投稿予定日) properties["投稿予定日"] = { date: { start: 投稿予定日 } };

    await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
    });

    // ✅ 成功画面
    res.send(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #f0fff0;
              font-family: sans-serif;
            }
            .message {
              font-size: 2rem; /* ← 大きくした */
              font-weight: bold;
              color: #2e7d32;
              text-align: center;
            }
            a {
              display: inline-block;
              margin-top: 20px;
              font-size: 1.5rem;
              color: #007bff;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="message">
            ✅ 投稿追加成功！
            <br>
            <a href="/">← 戻る</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error(error);
    res.status(500).send("エラーが発生しました");
  }
});

// iPhoneでも使いやすいフォーム
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: sans-serif;
            background-color: #f9f9f9;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #fff;
            width: 95%;
            max-width: 450px;
          }
          input, select, textarea, button {
            padding: 10px;
            font-size: 16px;
            width: 100%;
            box-sizing: border-box;
          }
          textarea {
            height: 100px;
            resize: vertical;
          }
          button {
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <form action="/add-post" method="post">
          投稿内容: <textarea name="名前"></textarea>
          投稿日付: <input type="datetime-local" name="投稿日付">
          ステータス: 
          <select name="ステータス">
            <option value="📝アイディア">📝アイディア</option>
            <option value="⌛️下書き">⌛️下書き</option>
            <option value="📅投稿予約">📅投稿予約</option>
            <option value="✅投稿済み">✅投稿済み</option>
          </select>
          SNS: 
          <select name="SNS">
            <option value="X">X</option>
            <option value="フィード">フィード</option>
            <option value="ストーリー">ストーリー</option>
          </select>
          投稿カテゴリー:
          <select name="投稿カテゴリー">
            <option value="その他">その他</option>
            <option value="コスメ">コスメ</option>
            <option value="スキンケア">スキンケア</option>
            <option value="ネイル">ネイル</option>
            <option value="ヘアケア">ヘアケア</option>
            <option value="趣味(フェイラー/紅茶)">趣味(フェイラー/紅茶)</option>
            <option value="ブランド紹介">ブランド紹介</option>
            <option value="懸賞">懸賞</option>
            <option value="PR案件">PR案件</option>
          </select>
          投稿リンク: <input type="url" name="投稿リンク">
          投稿予定日: <input type="date" name="投稿予定日">
          <button type="submit">追加</button>
        </form>
      </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
