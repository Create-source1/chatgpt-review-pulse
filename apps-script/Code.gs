const props = PropertiesService.getScriptProperties();

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.secret !== props.getProperty("SECRET")) return out({ ok: false, error: "unauthorized" });
    appendToDoc(p.entry);
    const draft = createDraft(p.entry);
    return out({ ok: true, draft_id: draft.getId() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function appendToDoc(entry) {
  const body = DocumentApp.openById(props.getProperty("DOC_ID")).getBody();
  body.appendHorizontalRule();
  body.appendParagraph("Entry: " + entry.date).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph("Top themes: " + entry.top_themes.join(" | "));
  body.appendParagraph("Weekly pulse").setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(entry.weekly_pulse);
  body.appendParagraph("Identified fee issue: " + entry.identified_fee_issue.title);
  body.appendParagraph("Explanation").setHeading(DocumentApp.ParagraphHeading.HEADING3);
  entry.explanation_bullets.forEach((b) => body.appendListItem(b));
  body.appendParagraph("Sources: " + entry.source_links.join(" | "));
  body.appendParagraph(entry.last_checked);
}

function createDraft(entry) {
  const subject = "Weekly Product Pulse + Customer Clarification \u2014 " + entry.date;
  const text =
    entry.weekly_pulse +
    "\n\n---\nSUPPORT SNIPPET: " + entry.identified_fee_issue.title + "\n" +
    entry.explanation_bullets.map((b) => "- " + b).join("\n") +
    "\n\nSources:\n" + entry.source_links.join("\n") +
    "\n" + entry.last_checked;
  return GmailApp.createDraft(props.getProperty("DRAFT_TO"), subject, text); // draft only, never sent
}

// Run this once from the editor to test (it needs no web request)
function testRun() {
  const entry = {
    date: "2026-10-17",
    top_themes: ["Test theme A", "Test theme B", "Test theme C"],
    weekly_pulse: "TEST pulse text.",
    identified_fee_issue: { title: "Test fee issue" },
    explanation_bullets: ["Test bullet one.", "Test bullet two."],
    source_links: ["https://help.openai.com/en/articles/7232927"],
    last_checked: "Last checked: 17 Oct 2026",
  };
  appendToDoc(entry);
  createDraft(entry);
}