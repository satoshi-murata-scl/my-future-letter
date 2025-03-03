import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  console.log("📩 API に POST リクエストが届きました！");

  try {
    const { currentSituation, futureGoals } = await req.json();
    console.log("🔍 受け取ったデータ:", { currentSituation, futureGoals });

    if (!currentSituation || !futureGoals) {
      console.error("❌ 入力が不足しています！");
      return NextResponse.json({ message: "しっかりとなりたい自分を入力してください。" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("🚀 OpenAI API にリクエスト送信中...");

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "あなたは未来の自分として励ましの手紙を書くAIです。" },
        { role: "user", content: `現在の状況: ${currentSituation}\n未来の目標: ${futureGoals}` },
      ],
      max_tokens: 1500,
    });

    console.log("✅ OpenAI からの応答:", response);

    if (!response || !response.choices || response.choices.length === 0) {
      console.error("❌ OpenAI の応答が無効です:", response);
      return NextResponse.json({ message: "AIの生成中にエラーが発生しました。" }, { status: 500 });
    }

    const letter = response.choices[0].message.content.trim();
    return NextResponse.json({ letter }, { status: 200 });

  } catch (error) {
    console.error("❌ APIエラー:", error);
    return NextResponse.json({ message: "エラーが発生しました。", error: error.message }, { status: 500 });
  }
}

// ✅ GET リクエストを許可（テスト用）
export async function GET() {
  return NextResponse.json({ message: "API は正常に動作しています。" });
}
