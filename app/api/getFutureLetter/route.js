import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  console.log("📩 API にリクエストが届きました！");

  try {
    const { currentSituation, futureGoals } = await req.json();

    if (!currentSituation || !futureGoals) {
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
        { 
          role: "user", 
          content: `
          【手紙の目的】  
          あなたは「未来の自分」として、「現在の自分」に向けて手紙を書いてください。  
          未来の自分は、目標を達成し、成功を掴んでいる状態です。  
          しかし、「今の自分」はまだ迷いや不安を抱えています。  
          そんな「今の自分」に向けて、励まし、アドバイスし、方向性を示す手紙を書いてください。  
          
          【手紙のポイント】  
          - 最初に「今の自分」を受け止めてあげる  
          - 未来の自分の視点から、達成したことを具体的に語る  
          - 「今の自分」に必要な行動を、温かくも力強く伝える  
          - もし迷っていたら、優しく背中を押してあげる  
          - 「未来の自分ならこうした」と具体的なアドバイスを入れる  
          - 最後に「これからも頑張れ！」とポジティブなエールで締めくくる  
          
          【手紙のフォーマット】  
          ---
          『未来の自分からの手紙』
          
          やあ、〇〇（今の自分の名前）！  
          未来の君から、君へ手紙を書いているよ。  
          
          今、君は「${currentSituation}」という状況にいるね。  
          でも大丈夫、未来の君は「${futureGoals}」を叶えているよ。  
          
          今の君は、不安もあるかもしれない。時にはくじけそうになることもあるだろう。  
          でもね、その努力は絶対に報われる。未来の僕が証明しているよ。  
          
          たとえば、僕はこうやって目標を達成したよ：
          - （具体的な成功のポイントを未来の視点で語る）
          - （困難を乗り越えた方法を優しくアドバイス）
          - （今の君に必要な行動を明確に示す）
          
          迷ったときは「どんな未来を作りたいのか？」を思い出してごらん。  
          君なら絶対にできる。  
          
          だから、安心して進んでほしい。  
          未来の僕は、いつでも君の味方だから。  
          
          これからも頑張れ！  
          君なら大丈夫！  
          ---
        ` 
        }
      ],
      max_tokens: 1500, // 🔹 長文でもしっかり表示されるようにする
    });

    const letter = response.choices[0].message.content.trim();

    console.log("✅ OpenAI からの応答:", letter);

    return NextResponse.json({ letter }, { status: 200 });
  } catch (error) {
    console.error("❌ APIエラー:", error);
    return NextResponse.json({ message: "エラーが発生しました。", error: error.message }, { status: 500 });
  }
}
