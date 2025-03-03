"use client";
import { useState } from "react";

export default function Home() {
  const [currentSituation, setCurrentSituation] = useState("");
  const [futureGoals, setFutureGoals] = useState("");
  const [letter, setLetter] = useState(""); // 手紙の内容
  const [loading, setLoading] = useState(false); // ロード中の状態

  async function fetchLetter() {
    setLetter(""); // 手紙をクリア
    setLoading(true); // ロード状態をON

    const response = await fetch("/api/getFutureLetter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentSituation, futureGoals }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });

      // **改行を適切に反映し、リアルタイム表示**
      setLetter(result.replace(/\n\n/g, "\n\n"));
    }

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

      <div className="w-full max-w-3xl mt-4 p-4 border rounded bg-gray-100 min-h-[300px] max-h-[500px] overflow-auto">
        {loading ? <p>手紙を作成中...</p> : <p style={{ whiteSpace: "pre-line" }}>{letter}</p>}
      </div>
    </main>
  );
}
