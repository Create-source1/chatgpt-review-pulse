export function analyzePrompt(reviews) {
    const list = reviews.map((r) => `[${r.id}] ${r.text}`).join("\n");
  
    return `You are a product analyst. Analyze ONLY the app reviews below.
  
  RULES
  - Group the reviews into at most 5 themes.
  - Pick the 3 biggest themes by number of reviews.
  - Pick exactly 3 quotes. Each quote must be copied word-for-word from one review, under 40 words, with no edits.
  - Find ONE recurring confusion or pain point about a fee, charge, price, refund, trial or subscription. It may cover related money problems (unexpected charge, failed trial payment, refund request, cancelling). List EVERY review id that supports it in evidence_review_ids, not just the strongest two.
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
  
  Return JSON only: {"bullets": ["", ""]}
  
  SOURCE DOCUMENTS
  ${docs}`;
  }