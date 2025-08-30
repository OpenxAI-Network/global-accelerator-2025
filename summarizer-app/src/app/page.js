"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [emailText, setEmailText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    setSummary("");
    setShowSummary(false);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: emailText }),
      });

      const data = await res.json();
      setSummary(data.summary);
      setShowSummary(true);
    } catch (err) {
      console.error(err);
      setSummary("Error generating summary");
      setShowSummary(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
      }}
    >
      <h1 style={{ marginBottom: "20px", color: "#333" }}>AI Email Summarizer</h1>

      <textarea
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
        placeholder="Paste your email here..."
        rows={8}
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "15px",
          fontSize: "16px",
        }}
      />

      <button
        onClick={handleSummarize}
        disabled={loading}
        style={{
          padding: "12px 25px",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "20px",
          transition: "transform 0.2s, background-color 0.2s",
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {showSummary && (
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            color: "#333",
            opacity: showSummary ? 1 : 0,
            transition: "opacity 0.5s ease-in",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </main>
  );
}
