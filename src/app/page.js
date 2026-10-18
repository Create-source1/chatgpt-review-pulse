"use client";
import { useState, useRef } from "react";

const STEPS = [
  { key: "read", label: "Reading reviews from the CSV" },
  { key: "analyze", label: "Clustering themes and detecting the fee issue" },
  { key: "pulse", label: "Writing the weekly product pulse" },
  { key: "explain", label: "Writing the fee explainer from official sources" },
  { key: "verify", label: "Verifying quotes and numbers" },
];

async function call(url, options) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || "Request failed");
  return json;
}
const post = (url, body) =>
  call(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [status, setStatus] = useState({});
  const [times, setTimes] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const started = useRef({});
  const timer = useRef(null);

  const begin = (k) => {
    started.current[k] = Date.now();
    setStatus((s) => ({ ...s, [k]: "running" }));
  };
  const finish = (k) => {
    setStatus((s) => ({ ...s, [k]: "done" }));
    setTimes((t) => ({ ...t, [k]: ((Date.now() - started.current[k]) / 1000).toFixed(0) }));
  };

  async function generate() {
    setError("");
    setData(null);
    setSaved(null);
    setStatus({});
    setTimes({});
    setElapsed(0);
    setLoading(true);
    const t0 = Date.now();
    timer.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 500);

    try {
      begin("read");
      finish("read");

      begin("analyze");
      const analysis = await call("/api/analyze");
      finish("analyze");

      begin("pulse");
      begin("explain");
      const [pulse, explainer] = await Promise.all([
        post("/api/pulse", { analysis }).then((r) => (finish("pulse"), r)),
        post("/api/explain", { feeIssue: analysis.fee_issue }).then((r) => (finish("explain"), r)),
      ]);

      begin("verify");
      finish("verify");

      setData({
        date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
        top_themes: analysis.top_themes,
        weekly_pulse: pulse.weekly_pulse,
        identified_fee_issue: analysis.fee_issue,
        explanation_bullets: explainer.explanation_bullets,
        source_links: explainer.source_links,
        last_checked: explainer.last_checked,
        checks: {
          pulse_words: pulse.word_count,
          verified_quotes: pulse.verified_quotes,
          unsupported_numbers: explainer.unsupported_numbers,
        },
      });
    } catch (e) {
      setError(e.message);
      setStatus((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v === "running" ? "error" : v])));
    }
    clearInterval(timer.current);
    setLoading(false);
  }

  async function approve() {
    setSaving(true);
    setError("");
    try {
      setSaved(await post("/api/approve", data));
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  const card = { background: "#fff", color: "#111", border: "1px solid #e5e5e5", borderRadius: 10, padding: 18, marginTop: 16 };
  const icon = { pending: "○", running: "…", done: "✓", error: "✗" };
  const iconColor = { pending: "#aaa", running: "#d98200", done: "#1a8f3c", error: "crimson" };

  return (
    <main style={{ maxWidth: 840, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ marginBottom: 4 }}>Review Pulse</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Turns ChatGPT Play Store reviews into a weekly product pulse and a support explainer.
      </p>

      <button
        onClick={generate}
        disabled={loading || saving}
        style={{ padding: "10px 18px", fontSize: 16, cursor: loading ? "wait" : "pointer", background: "#111", color: "#fff", border: 0, borderRadius: 8 }}
      >
        {loading ? `Working... ${elapsed}s` : "Generate weekly update"}
      </button>

      {(loading || Object.keys(status).length > 0) && (
        <div style={card}>
          <strong>Pipeline</strong>
          <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0" }}>
            {STEPS.map((s) => {
              const st = status[s.key] || "pending";
              return (
                <li key={s.key} style={{ padding: "4px 0", color: st === "pending" ? "#999" : "#111" }}>
                  <span style={{ display: "inline-block", width: 22, color: iconColor[st], fontWeight: 700 }}>{icon[st]}</span>
                  {s.label}
                  {st === "done" && times[s.key] !== undefined && times[s.key] !== "0" && (
                    <span style={{ color: "#888" }}> ({times[s.key]}s)</span>
                  )}
                  {st === "running" && <span style={{ color: "#d98200" }}> running</span>}
                </li>
              );
            })}
          </ul>
          {loading && (
            <p style={{ fontSize: 13, color: "#777", marginBottom: 0 }}>
              Runs on a free LLM tier, so this usually takes 1 to 2 minutes. Pulse and explainer run in parallel.
            </p>
          )}
        </div>
      )}

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {data && (
        <>
          <div style={card}>
            <h2 style={{ marginTop: 0 }}>Weekly Product Pulse</h2>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{data.weekly_pulse}</pre>
          </div>

          <div style={card}>
            <h2 style={{ marginTop: 0 }}>Fee explainer: {data.identified_fee_issue.title}</h2>
            <ul>
              {data.explanation_bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p style={{ marginBottom: 4 }}>
              Sources:{" "}
              {data.source_links.map((u, i) => (
                <span key={u}>
                  {i > 0 && " | "}
                  <a href={u} target="_blank" rel="noreferrer">{u}</a>
                </span>
              ))}
            </p>
            <p style={{ margin: 0 }}>{data.last_checked}</p>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 0 }}>
              Checks: {data.checks.pulse_words} words, {data.checks.verified_quotes} verified quotes,{" "}
              {data.checks.unsupported_numbers.length} unsupported numbers
            </p>
          </div>

          <div style={{ ...card, border: "2px solid #f0a500" }}>
            <h2 style={{ marginTop: 0 }}>Approval required</h2>
            <p>
              <strong>Nothing has been saved yet.</strong> If you approve, the app will:
            </p>
            <ol>
              <li>Append this entry (date, themes, pulse, fee issue, explanation, sources) to the Google Doc.</li>
              <li>Create a Gmail <strong>draft</strong> with the pulse and the support snippet. It is never sent automatically.</li>
            </ol>
            {saved ? (
              <p style={{ color: "green", marginBottom: 0 }}>
                Approved. Entry added to the Doc and a draft was created in Gmail Drafts.
              </p>
            ) : (
              <>
                <button onClick={approve} disabled={saving} style={{ padding: "10px 18px", fontSize: 16, cursor: "pointer", marginRight: 10 }}>
                  {saving ? "Saving..." : "Approve and save"}
                </button>
                <button onClick={() => setData(null)} disabled={saving} style={{ padding: "10px 18px", fontSize: 16, cursor: "pointer" }}>
                  Reject
                </button>
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}