"use client";
import { useState } from "react";

export default function Home() {
  const [currentSituation, setCurrentSituation] = useState("");
  const [futureGoals, setFutureGoals] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentSituation || !futureGoals) {
      setMessage("しっかりとなりたい自分を入力してください。");
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/getFutureLetter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentSituation, futureGoals }),
    });

    if (!response.ok) {
      setMessage("エラーが発生しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    const data = await response.json();
    setMessage(data.letter);
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">未来からの手紙</h1>

      <textarea
        className="w-full max-w-md p-2 border rounded mb-2"
        rows="3"
        placeholder="現在の状況を入力してください"
        value={currentSituation}
        onChange={(e) => setCurrentSituation(e.target.value)}
      />

      <textarea
        className="w-full max-w-md p-2 border rounded mb-2"
        rows="3"
        placeholder="未来の方向性やなりたい自分を入力してください"
        value={futureGoals}
        onChange={(e) => setFutureGoals(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "作成中..." : "未来からの手紙を受け取る"}
      </button>

      {message && (
        <div className="mt-4 p-4 bg-white border rounded shadow-md w-full max-w-md overflow-auto">
          <h2 className="text-lg font-semibold mb-2">未来からの手紙</h2>
          <p>{message}</p>
        </div>
      )}
    </main>
  );
}
