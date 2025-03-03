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
        { role: "system", content: "あなたは未来の自分として励ましの手紙を書くAIです。文章は親しみやすく、温かい口調で書いてください。適切に改行し、見やすい文章にしてください。" },
        { role: "user", content: `
          【手紙の目的】  
          あなたは「未来の自分」として、「現在の自分」に向けて励ましの手紙を書いてください。  

          **現在の君は「${currentSituation}」という状況にいるね。**  
          でも、大丈夫。未来の君は「${futureGoals}」を叶えているよ。  

          **手紙のフォーマット:**  
          ---
          # 『未来の自分からの手紙』

          やあ、君へ。

          いま、ちょっと大変だよね。「${currentSituation}」という状況にいる君のことを、未来の僕はちゃんと知っているよ。  
          そんな君に伝えたいことがあって、この手紙を書いているんだ。

          **まずはね、今の状況をしっかりと受け止めてほしい。**  
          きっと不安もあるだろうし、先が見えないこともあるかもしれない。  
          でも、その経験が君を成長させてくれるんだ。

          **未来の君は、「${futureGoals}」という夢を叶えているよ。**  

          信じられないかもしれないけれど、それは本当のこと。  
          どうやってそこにたどり着いたのか、少しずつ教えていくね。

          **まずは、小さな成功を積み重ねることから始めたんだ。**  
          毎日の目標を決めて、それをコツコツ達成することで「できる」という実感を深めていった。  
          それが自信になり、次のステップへ進む力になったんだよ。

          それから、人とのつながりを大切にした。  
          成功した人から学び、自分の考えだけに固執せずに、柔軟に成長していったんだ。  

          **そして、一番大事なのは「諦めなかったこと」。**  
          失敗もたくさんあったけど、そのたびに「なぜうまくいかなかったのか？」を考え、次に活かした。  
          その繰り返しが、今の僕を作ってくれたんだ。

          もし君が道に迷ったり、挫けそうになったりしたら、この未来の僕を思い出してほしい。  
          君は一人じゃないし、必ず乗り越えられる強さを持っている。

          疲れたと感じたら、少し休んでもいい。  
          でも、夢は手放さないでほしい。  

          君ならできる。その証拠に、未来の僕はちゃんとここにいるよ。

          **明日も一緒に頑張ろう。**

          未来の自分より
          ---
        ` },
      ],
      max_tokens: 600, 
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
