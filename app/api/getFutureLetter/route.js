import { NextResponse } from "next/server";
import OpenAI from "openai";

// タイムアウトを 15 秒に設定
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

    // ⏳ `Promise.race()` を使って 15 秒以上かかる場合はタイムアウト
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("OpenAI API request timeout")), TIMEOUT)
    );

    const openaiPromise = openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "あなたは未来の自分として励ましの手紙を書くAIです。" },
        { role: "user", content: `現在の状況: ${currentSituation}\n未来の目標: ${futureGoals}` },
      ],
      max_tokens: 800, // 応答を短縮し高速化
      temperature: 0.7, // 高速化のため適度に制限
    });

    const response = await Promise.race([openaiPromise, timeoutPromise]);

    console.log("✅ OpenAI からの応答:", response);

    if (!response || !response.choices || response.choices.length === 0) {
      console.error("❌ OpenAI の応答が無効です:", response);
      return NextResponse.json({ message: "AIの生成中にエラーが発生しました。" }, { status: 500 });
    }

    console.log("✅ 応答の処理を開始...");
    const letter = response.choices[0].message.content.trim();
    return NextResponse.json({ letter }, { status: 200 });

  } catch (error) {
    console.error("❌ APIエラー:", error.message);
    if (error.message.includes("timeout")) {
      return NextResponse.j
