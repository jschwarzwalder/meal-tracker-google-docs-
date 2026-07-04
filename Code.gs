function onOpen() {
  DocumentApp.getUi()
    .createMenu("Meal Tracker")
    .addItem("Insert Meal Entry", "insertMealEntry")
    .addToUi();
}

// =====================
// Helpers
// =====================
const H2 = text => ({ type: "h2", text });
const H3 = text => ({ type: "h3", text });
const P = text => ({ type: "p", text });
const BLANK = { type: "blank" };
const HR = { type: "hr" };

// =====================
// Main Entry
// =====================
function insertMealEntry() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const cursor = doc.getCursor();

  const now = new Date();
  const tz = Session.getScriptTimeZone();

  const dateString = Utilities.formatDate(now, tz, "yyyy-MM-dd");
  const timeString = Utilities.formatDate(now, tz, "h:mm a");

  const template = buildTemplate(dateString, timeString);

  // If no cursor → append to end
  if (!cursor) {
    renderAtEnd(body, template);
    return;
  }

  const element = cursor.getElement();

  // Find nearest BODY-level element safely
  let parent = element;

  while (
    parent &&
    parent.getParent() &&
    parent.getParent().getType() !== DocumentApp.ElementType.BODY_SECTION
  ) {
    parent = parent.getParent();
  }

  // If something weird happens, fallback
  if (!parent) {
    renderAtEnd(body, template);
    return;
  }

  const index = body.getChildIndex(parent);

  renderAtIndex(body, template, index);
}

// =====================
// Template Builder
// =====================
function buildTemplate(dateString, timeString) {
  return [
    H2("Meal Entry"),
    BLANK,

    P("Meal #:"),
    P(`Date: ${dateString}`),
    P(`Meal time (start): ${timeString}`),
    BLANK,

    H3("Food"),
    P("Food & portions (be specific):"),
    BLANK,

    P("Protein at meal? (Y/N; what/how much):"),
    BLANK,

    P("Carb type(s):"),
    P("Total carbohydrates (if known):"),
    BLANK,

    P("Cooking method:"),
    BLANK,

    P("Sauces/added fats:"),
    BLANK,

    P("Fiber/vegetables included? (Y/N; what):"),
    BLANK,

    P("Caffeine/alcohol? (Y/N; what/how much):"),
    BLANK,

    P("Other notes:"),
    BLANK,

    H3("Dexcom Readings"),
    P("Pre-meal glucose:"),
    P("30 min glucose:"),
    P("60 min glucose:"),
    P("90 min glucose:"),
    P("120 min glucose:"),
    P("Peak glucose:"),
    P("Peak time:"),
    P("Time above 180 mg/dL:"),
    P("Time below 70 mg/dL:"),
    P("Symptoms:"),
    BLANK,

    H3("Optional Notes"),
    P("Anything unusual about this meal?"),
    BLANK,

    P("Overall thoughts:"),
    HR
  ];
}

// =====================
// Render at End
// =====================
function renderAtEnd(body, template) {
  template.forEach(item => renderItem(body, item, null));
}

// =====================
// Render at Index
// =====================
function renderAtIndex(body, template, startIndex) {
  let index = startIndex;

  template.forEach(item => {
    index++;

    renderItem(body, item, index);
  });
}

// =====================
// Render Single Item
// =====================
function renderItem(body, item, index) {
  if (item.type === "h2") {
    const p = index != null
      ? body.insertParagraph(index, item.text)
      : body.appendParagraph(item.text);

    p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }

  else if (item.type === "h3") {
    const p = index != null
      ? body.insertParagraph(index, item.text)
      : body.appendParagraph(item.text);

    p.setHeading(DocumentApp.ParagraphHeading.HEADING3);
  }

  else if (item.type === "p") {
    return index != null
      ? body.insertParagraph(index, item.text)
      : body.appendParagraph(item.text);
  }

  else if (item.type === "blank") {
    return index != null
      ? body.insertParagraph(index, "")
      : body.appendParagraph("");
  }

  else if (item.type === "hr") {
    return index != null
      ? body.insertHorizontalRule(index)
      : body.appendHorizontalRule();
  }
}
