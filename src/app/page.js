"use client";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  async function generate() {
    setLoading(true);
    setError("");
    setData(null);
    setSaved(null);
    try {
      const res = await fetch("/api/generate");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function approve() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      setSaved(json);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  const box = { background: "#f5f5f5", color: "#111", padding: 16, borderRadius: 8 };

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1>Review Pulse</h1>
      <p>Turns ChatGPT Play Store reviews into a weekly product pulse and a support explainer.</p>

      <button onClick={generate} disabled={loading || saving} style={{ padding: "10px 18px", fontSize: 16, cursor: "pointer" }}>
        {loading ? "Analysing reviews..." : "Generate weekly update"}
      </button>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {data && (
        <>
          <h2>Weekly Product Pulse</h2>
          <pre style={{ ...box, whiteSpace: "pre-wrap" }}>{data.weekly_pulse}</pre>

          <h2>Fee explainer: {data.identified_fee_issue.title}</h2>
          <ul>
            {data.explanation_bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p>
            Sources:{" "}
            {data.source_links.map((u, i) => (
              <span key={u}>
                {i > 0 && " | "}
                <a href={u} target="_blank" rel="noreferrer">{u}</a>
              </span>
            ))}
          </p>
          <p>{data.last_checked}</p>
          <p style={{ fontSize: 13, opacity: 0.7 }}>
            Checks: {data.checks.pulse_words} words, {data.checks.verified_quotes} verified quotes,{" "}
            {data.checks.unsupported_numbers.length} unsupported numbers
          </p>

          <h2>Approval required</h2>
          <div style={{ ...box, border: "2px solid #f0a500" }}>
            <p style={{ marginTop: 0 }}>
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

// "use client";
// import { useState } from "react";

// export default function Home() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function generate() {
//     setLoading(true);
//     setError("");
//     setData(null);
//     try {
//       const res = await fetch("/api/generate");
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.error || "Request failed");
//       setData(json);
//     } catch (e) {
//       setError(e.message);
//     }
//     setLoading(false);
//   }

//   return (
//     <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
//       <h1>Review Pulse</h1>
//       <p>Turns ChatGPT Play Store reviews into a weekly product pulse and a support explainer.</p>

//       <button onClick={generate} disabled={loading} style={{ padding: "10px 18px", fontSize: 16, cursor: "pointer" }}>
//         {loading ? "Analysing reviews..." : "Generate weekly update"}
//       </button>

//       {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

//       {data && (
//         <>
//           <h2>Weekly Product Pulse</h2>
//           <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", color: "#111", padding: 16, borderRadius: 8 }}>
//             {data.weekly_pulse}
//           </pre>

//           <h2>Fee explainer: {data.identified_fee_issue.title}</h2>
//           <ul>
//             {data.explanation_bullets.map((b, i) => (
//               <li key={i}>{b}</li>
//             ))}
//           </ul>
//           <p>
//             Sources:{" "}
//             {data.source_links.map((u, i) => (
//               <span key={u}>
//                 {i > 0 && " | "}
//                 <a href={u} target="_blank" rel="noreferrer">{u}</a>
//               </span>
//             ))}
//           </p>
//           <p>{data.last_checked}</p>

//           <p style={{ fontSize: 13, opacity: 0.7 }}>
//             Checks: {data.checks.pulse_words} words, {data.checks.verified_quotes} verified quotes,{" "}
//             {data.checks.unsupported_numbers.length} unsupported numbers
//           </p>
//         </>
//       )}
//     </main>
//   );
// }

// import Image from "next/image";
// import styles from "./page.module.css";

// export default function Home() {
//   return (
//     <div className={styles.page}>
//       <main className={styles.main}>
//         <Image
//           className={styles.logo}
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className={styles.intro}>
//           <h1>
//             To get started, edit the{" "}
//             <code className={styles.code}>page.js</code> file.
//           </h1>
//           <p>
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className={styles.ctas}>
//           <a
//             className={styles.primary}
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className={styles.logo}
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={14}
//             />
//             Deploy Now
//           </a>
//           <a
//             className={styles.secondary}
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
