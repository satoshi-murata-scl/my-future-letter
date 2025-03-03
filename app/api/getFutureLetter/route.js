import { NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAI API のタイムアウトを 15秒 に設定
const TIMEOUT = 15000;

export async function POST(req) {
  console.log("📩 API に POST リクエストが届きました！");

  try {
    console.log("✅ リクエストを JSON 解析中...");
    const { currentSituation, futureGoals } = await req.json();
    console.log("🔍 受け取ったデータ:", { currentSituation, futureGoals });

    if (!currentSituation || !futureGoals) {
      console.error("❌ 入力が不足しています！");
      return NextResponse.json({ message: "しっかりとなりたい自分を入力してください。" }, { status: 400 });
    }

    console.log("🚀 OpenAI API にリクエスト送信中...");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // `AbortController` を使って 15 秒以上かかるリクエストを強制終了
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "あなたは未来の自分として励ましの手紙を書くAIです。" },
          { role: "user", content: `現在の状況: ${currentSituation}\n未来の目標: ${futureGoals}` },
        ],
        max_tokens: 800, // 応答を短縮し高速化
        temperature: 0.7, // 高速化のため適度に制限
        signal: controller.signal, // タイムアウト制御
      });
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("❌ OpenAI API のリクエストがタイムアウトしました！");
        return NextResponse.json({ message: "AI の応答が遅いため、処理を中断しました。もう一度お試しください。" }, { status: 504 });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    console.log("✅ OpenAI からの応答:", response);

    if (!response || !response.choices || response.choices.length === 0) {
      console.error("❌ OpenAI の応答が無効です:", response);
      return NextResponse.json({ message: "AIの生成中にエラーが発生しました。" }, { status: 500 });
    }

    console.log("✅ 応答の処理を開始...");
    const letter = response.choices[0].message.content.trim();
    return NextResponse.json({ letter }, { status: 200 });

  } catch (error) {
    console.error("❌ APIエラー:", error);
    return NextResponse.json({ message: "エラーが発生しました。", error: error.message }, { status: 500 });
  }
}
