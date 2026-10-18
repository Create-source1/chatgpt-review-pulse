export function analyzePrompt(reviews) {
    const list = reviews.map((r) => `[${r.id}] ${r.text}`).join("\n");
  
    return `You are a product analyst. Analyze ONLY the app reviews below.
  
  RULES
  - Group the reviews into at most 5 themes.
  - Pick the 3 biggest themes by number of reviews.
  - Pick exactly 3 quotes. Each quote must be copied word-for-word from one review, under 25 words, with no edits.
  - Find ONE recurring confusion or pain point about a fee, charge, price, refund, trial or subscription. It may cover related money problems (unexpected charge, failed trial payment, refund request, cancelling). List EVERY review id that supports it in evidence_review_ids, not just the strongest two.
  - Describe only what users said they experienced. Do not use words like "difficulties" or "problems getting refunds" unless a review says a refund was refused or hard to get.
  - Do not invent facts. If something is not in the reviews, leave it out.
  
  Return JSON only, in this shape:
  {
    "themes": [{"name": "", "summary": "", "review_ids": []}],
    "top_themes": ["", "", ""],
    "quotes": [{"review_id": "", "theme": "", "quote": ""}],
    "fee_issue": {"title": "", "confusion": "", "evidence_review_ids": []}
  }
  
  REVIEWS
  ${list}`;
  }

  export function explainerPrompt(feeIssue, sources) {
    const docs = sources.map((s) => `--- ${s.file} ---\n${s.text}`).join("\n\n");
  
    return `You write a support explainer for a customer-confusion topic.
  
  TOPIC (from real user reviews): ${feeIssue.title}
  What users are confused about: ${feeIssue.confusion}
  
  RULES
  - Use ONLY facts stated in the SOURCE DOCUMENTS below. Do not use outside knowledge.
  - Keep the source's hedges and conditions. If the source says "may" or "generally", say "may" or "generally". Never turn a possibility into a guarantee.
  - Write at most 6 bullet points. One short sentence each.
  - Neutral, facts-only tone. No apologies, no promises, no blame, no marketing words.
  - Cover what a confused customer needs: why a charge can happen, what cancelling does and does not do, the refund window and its conditions, and where to request a refund.
  - Do not include links or dates. They are added separately.
  - Do not add details the source does not state (for example, do not say "automatically" unless the source does).
  
  Return JSON only: {"bullets": ["", ""]}
  
  SOURCE DOCUMENTS
  ${docs}`;
  }

  export function pulsePrompt(analysis, reviewCount) {
    const themes = analysis.top_themes
      .map((t) => {
        const th = analysis.themes.find((x) => x.name === t);
        return `- ${t}: ${th?.review_ids?.length || 0} of ${reviewCount} reviews. ${th?.summary || ""}`;
      })
      .join("\n");
  
    return `You write a weekly product pulse for a product team. Use ONLY the analysis below.
  
  TOP THEMES
  ${themes}
  
  FEE ISSUE: ${analysis.fee_issue.title} (${analysis.fee_issue.evidence_review_ids.length} reviews). ${analysis.fee_issue.confusion}
  
  RULES
  - theme_lines: exactly 3 strings, one per top theme in the same order, at most 15 words each, plain language.
  - key_observation: at most 45 words. What is going wrong or trending, and why it matters. Mention the fee issue.
  - actions: exactly 3 concrete ideas for the product team, at most 18 words each, each tied to something in the analysis. No vague advice.
  - Neutral tone. Do not invent numbers or facts.
  - Be precise about scale. When fewer than 5 reviews support a point, give the exact count (for example "one review" or "two reviews"). Never write "a few", "frequent" or "many" for those.
  - Do not claim business impact (conversion, churn, revenue). Report what users said, not what it causes.
  - Write the 3 actions as things to test or investigate (start with Test, Audit or Review), not as confirmed fixes.
  - Do not put review counts inside theme_lines. Mention a count only for the fee issue, inside key_observation.
  
  Return JSON only: {"theme_lines": ["","",""], "key_observation": "", "actions": ["","",""]}`;
  }