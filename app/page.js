"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [currentSituation, setCurrentSituation] = useState("");
  const [futureGoals, setFutureGoals] = useState("");
  const [letter, setLetter] = useState(""); // 手紙の内容
  const [loading, setLoading] = useState(false); // ロード中の状態
  const letterRef = useRef(null); // スクロール用の参照
  const fullLetter = useRef(""); // ✅ 最後までの文章を保存する変数

  // ✅ 手紙の内容が変わるたびにスクロールする
  useEffect(() => {
    if (letterRef.current) {
      letterRef.current.scrollTop = letterRef.current.scrollHeight;
    }
  }, [letter]);

  async function fetchLetter() {
    setLetter(""); // 手紙をクリア
    fullLetter.current = ""; // ✅ フルの文章をリセット
    setLoading(true); // ロード状態をON

    const response = await fetch("/api/getFutureLetter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentSituation, futureGoals }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let isDone = false; // ✅ 最後の `done` 判定を厳密に処理

    while (!isDone) {
      const { done, value } = await reader.read();
      if (done) {
        isDone = true;
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      fullLetter.current += chunk;

      // ✅ **リアルタイムでデータを反映**
      setLetter((prev) => prev + chunk);

      // ✅ **100ms ごとにスクロール処理**
      setTimeout(() => {
        if (letterRef.current) {
          letterRef.current.scrollTop = letterRef.current.scrollHeight;
        }
      }, 100);
    }

    // ✅ **最後のデータをしっかり反映**
    setLetter(fullLetter.current);
    setLoading(false); // ロード状態をOFF
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">未来からの手紙</h1>

      <textarea
        className="w-full max-w-3xl p-3 border rounded mb-2"
        placeholder="現在の状況を入力してください"
        value={currentSituation}
        onChange={(e) => setCurrentSituation(e.target.value)}
      />

      <textarea
        className="w-full max-w-3xl p-3 border rounded mb-4"
        placeholder="未来の目標を入力してください"
        value={futureGoals}
        onChange={(e) => setFutureGoals(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        onClick={fetchLetter}
        disabled={loading}
      >
        {loading ? "作成中..." : "未来からの手紙を受け取る"}
      </button>

      {/* ✅ **出力エリアをスクロール可能にし、UIに確実に反映** */}
      <div
        ref={letterRef}
        className="w-full max-w-3xl mt-4 p-4 border rounded bg-gray-100 min-h-[300px] max-h-[700px] overflow-y-auto"
        style={{ whiteSpace: "pre-line" }}
      >
        {loading ? <p>手紙を書いています...</p> : <p>{letter}</p>}
      </div>
    </main>
  );
}
