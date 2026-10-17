export async function POST(request) {
    try {
      const body = await request.json();
  
      // Send only the fields the assignment specifies
      const entry = {
        date: body.date,
        top_themes: body.top_themes,
        weekly_pulse: body.weekly_pulse,
        identified_fee_issue: body.identified_fee_issue,
        explanation_bullets: body.explanation_bullets,
        source_links: body.source_links,
        last_checked: body.last_checked,
      };
      const missing = Object.keys(entry).filter((k) => !entry[k]);
      if (missing.length) {
        return Response.json({ ok: false, error: `Missing: ${missing.join(", ")}` }, { status: 400 });
      }
  
      const res = await fetch(process.env.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ secret: process.env.APPS_SCRIPT_SECRET, entry }),
        redirect: "follow",
      });
  
      const raw = await res.text();
      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        return Response.json(
          { ok: false, error: "Apps Script did not return JSON. Check the deployment access setting." },
          { status: 502 }
        );
      }
      return Response.json(result, { status: result.ok ? 200 : 502 });
    } catch (err) {
      return Response.json({ ok: false, error: String(err.message || err) }, { status: 500 });
    }
  }