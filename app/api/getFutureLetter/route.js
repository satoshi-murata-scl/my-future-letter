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

    console.log("🚀 OpenAI API にリクエスト送信中...");

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "あなたは未来の自分として励ましの手紙を書くAIです。優しく寄り添いながら、前向きな言葉を届けてください。改行を適切に入れ、読みやすいように工夫してください。" },
        { role: "user", content: `
          【手紙の目的】  
          あなたは「未来の自分」として、「現在の自分」に向けて励ましの手紙を書いてください。  

          **今の自分は「${currentSituation}」という状況にいる。**  
          でも、大丈夫。未来の自分は「${futureGoals}」を叶えているよ。  

          **ポイント:**  
          - 最初に「今の自分」を受け止めてあげる  
          - 未来の自分がどんな風になっているかを伝える  
          - 「今の自分」が前向きになれるように、優しく背中を押す  
          - 具体的なアドバイスを入れる  
          - 最後はポジティブなメッセージで締めくくる  

          **手紙のフォーマット:**  
          ---
          『未来の自分からの手紙』

          やあ、君へ。  

          いま、ちょっと大変だよね。「${currentSituation}」で頑張っているの、知っているよ。  
          でもね、心配しないでほしい。ちゃんと前に進んでいるから。  

          **未来の君は、「${futureGoals}」を叶えているよ。**  
          どんな道のりだったか、話してあげるね。  

          まず、焦らずに一歩ずつ進むことを決めたんだ。  
          そうすると、少しずつ景色が変わっていったよ。  

          「今の自分」は、迷ったり、不安になったりするかもしれない。  
          でも大丈夫。未来の僕が、君がちゃんと乗り越えられることを知っているから。  

          ちょっと疲れたら、深呼吸してみて。  
          そして、「どんな未来を作りたいのか」を思い出してみてほしい。  

          君なら、絶対にできる。  

          **だから、大丈夫。**  
          未来の僕は、いつでも君の味方だからね。  

          これからも一歩ずつ進んでいこう！  
          ---
        ` },
      ],
      max_tokens: 500, // 🔹 応答を短くして高速化
      temperature: 0.7,
    });

    console.log("✅ OpenAI からの応答:", response);

    if (!response || !response.choices || response.choices.length === 0) {
      return NextResponse.json({ message: "AIの生成中にエラーが発生しました。" }, { status: 500 });
    }

    // 文章を1行ずつ分けて、少しずつ表示させるための配列に変換
    const letter = response.choices[0].message.content.trim().split("\n");

    return NextResponse.json({ letter }, { status: 200 });

  } catch (error) {
    console.error("❌ APIエラー:", error);
    return NextResponse.json({ message: "エラーが発生しました。", error: error.message }, { status: 500 });
  }
}
