"use client";
import { useState } from "react";

export default function Home() {
  const [currentState, setCurrentState] = useState("");
  const [futureGoal, setFutureGoal] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFutureLetter = async () => {
    setError("");
    setResponse(null);
    setLoading(true); // 🔹 ボタンを押したら「作成中...」表示

    if (currentState.trim() === "" || futureGoal.trim() === "") {
      setError("しっかりとなりたい自分を入力してください。");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/getFutureLetter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentState, futureGoal }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false); // 🔹 手紙の作成が終わったら「作成中...」を消す
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">📨 My Future Letter</h1>

      <label className="block text-lg font-semibold">現在の状況</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows="3"
        placeholder="今の自分の状況を入力..."
        value={currentState}
        onChange={(e) => setCurrentState(e.target.value)}
      ></textarea>

      <label className="block text-lg font-semibold">未来の方向性・なりたい自分</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows="3"
        placeholder="理想の未来やなりたい姿を入力..."
        value={futureGoal}
        onChange={(e) => setFutureGoal(e.target.value)}
      ></textarea>

      {/* 🔹 ボタンの hover でカーソルを変える */}
      <button
        onClick={fetchFutureLetter}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 cursor-pointer"
        style={{ cursor: "pointer" }}
        disabled={loading}
      >
        {loading ? "作成中..." : "未来の自分から手紙をもらう ✉️"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* 🔹 手紙の作成中のメッセージ */}
      {loading && <p className="text-gray-500 mt-4">手紙を作成中です... 📜</p>}

      {/* 🔹 未来の手紙を表示 */}
      {response && (
        <div className="mt-4 p-4 border rounded bg-gray-100 max-h-60 overflow-y-auto">
          <h2 className="text-lg font-semibold">未来のあなたからの手紙 💌</h2>
          <p className="whitespace-pre-wrap">{response.letter}</p>
        </div>
      )}
    </div>
  );
}
