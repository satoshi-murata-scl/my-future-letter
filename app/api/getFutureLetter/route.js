import { NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  console.log("📩 API に POST リクエストが届きました！");

  try {
    const { currentSituation, futureGoals } = await req.json();
    console.log("🔍 受け取ったデータ:", { currentSituation, futureGoals });

    if (!currentSituation || !futureGoals) {
      return NextResponse.json({ message: "しっかりとなりたい自分を入力してください。" }, { status: 400 });
    }

    console.log("🚀 OpenAI API にストリームリクエスト送信中...");

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: `
          あなたは未来の自分として励ましの手紙を書くAIです。
          - ユーザーが入力したテキストをそのまま使わず、適切に言い換えて手紙を作成してください。
          - 文章は読みやすく、温かみのある言葉を使ってください。
          - **文章の構成をテンプレート化せず、自然な手紙として書いてください。**
          - **改行と段落ごとのスペースを適切に入れてください。**
          - **「僕」「私」などの一人称を使わず、性別に偏らない表現を心がけてください。**
        `},
        { role: "user", content: `
          未来の自分から今の自分への手紙を書いてください。
          現在の状況: 「${currentSituation}」
          未来の目標: 「${futureGoals}」
        `},
      ],
      max_tokens: 700, 
      temperature: 0.7,
      stream: true, // 🔹 ストリーミングモードを有効化
    });

    console.log("✅ OpenAI からの応答をストリーミング中...");

    // ストリーミングデータをクライアントに送る
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(text);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("❌ APIエラー:", error);
    return NextResponse.json({ message: "エラーが発生しました。", error: error.message }, { status: 500 });
  }
}
