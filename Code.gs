/* global DocumentApp, Session, Utilities */

function onOpen() {
  DocumentApp.getUi()
    .createMenu("Meal Tracker")
    .addItem("Insert Meal Entry", "insertMealEntry")
    .addToUi();
}

// =====================
// Helpers
// =====================
const TYPE = Object.freeze({
  H2: "h2",
  H3: "h3",
  P: "p",
  BLANK: "blank",
  HR: "hr"
});

const H2 = text => ({ type: TYPE.H2, text });
const H3 = text => ({ type: TYPE.H3, text });
const P = text => ({ type: TYPE.P, text });
const BLANK = { type: TYPE.BLANK };
const HR = { type: TYPE.HR };


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
    H2(`Meal Entry — ${dateString} ${timeString}`),
    BLANK,

    P("Meal #:"),
    P(`Date: ${dateString}`),
    P(`Meal time (start/end): ${timeString} / _____`),
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

    P("Context / notes"),
    P("Hunger/stress/exercise/illness/ate quickly or slowly (short notes):"),

    BLANK,

    H3("Dexcom Readings (start at first bite)"),
    P("Pre-meal glucose:"),
    P("30 min glucose:"),
    P("60 min glucose:"),
    P("90 min glucose:"),
    P("120 min glucose:"),
    P("Peak glucose (0–2h):"),
    P("Peak time (minutes after first bite or clock time ):"),
    P("Time >180 mg/dL (approx minutes or start–end clock times):"),
    P("Time below 70 mg/dL (rough):"),
    P("Symptoms:"),
    BLANK,

    H3("Optional Notes"),
    P("Anything unusual about this meal?"),
    BLANK,

    P("Overall thoughts (1–2 lines):"),
    BLANK,
    HR,
    BLANK
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
  if (item.type === TYPE.H2) {
    const p = index != null
      ? body.insertParagraph(index, item.text)
      : body.appendParagraph(item.text);

    p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }

  else if (item.type === TYPE.H3) {
    const p = index != null
      ? body.insertParagraph(index, item.text)
      : body.appendParagraph(item.text);

    p.setHeading(DocumentApp.ParagraphHeading.HEADING3);
  }

  else if (item.type === TYPE.P) {
    return index != null
      ? body.insertParagraph(index, item.text)
      : body.appendParagraph(item.text);
  }

  else if (item.type === TYPE.BLANK) {
    return index != null
      ? body.insertParagraph(index, "")
      : body.appendParagraph("");
  }

  else if (item.type === TYPE.HR) {
    return index != null
      ? body.insertHorizontalRule(index)
      : body.appendHorizontalRule();
  }
}
