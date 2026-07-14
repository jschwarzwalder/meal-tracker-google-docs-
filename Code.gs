// Glucose Tracker
// Version: 1.6
// Last updated: 2026-07-13
// Changes: Template updates and AI prompt alignment

/* global DocumentApp, Session, Utilities */

function onOpen() {
  DocumentApp.getUi()
    .createMenu("Glucose Tracker")
    .addItem("Insert Meal Entry", "insertMealEntry")
    .addItem("Insert Wake Entry", "insertWakeEntry")
    .addItem("Insert Bedtime Entry", "insertBedtimeEntry")
    .addSeparator()
    .addItem("Insert Sensor Change", "insertSensorChange")
    .addItem("Insert Transmitter Change", "insertTransmitterChange")
    .addToUi();
}

// =====================
// Helpers
// =====================
const TYPE = Object.freeze({
  H2: "h2",
  H3: "h3",
  P: "p",  
  CHECKBOX: "checkbox",
  BLANK: "blank",
  HR: "hr"
});

const H2 = text => ({ type: TYPE.H2, text });
const H3 = text => ({ type: TYPE.H3, text });
const P = (text, bold = false) => ({ type: TYPE.P, text, bold });
const CHECKBOX = text => ({ type: TYPE.CHECKBOX, text }); 
const BLANK = { type: TYPE.BLANK };
const HR = { type: TYPE.HR };
const PAGE_BREAK = { type: "page_break" };


// =====================
// Tab-Aware Body Target Helper
// =====================
function getTargetBody() {
  const doc = DocumentApp.getActiveDocument();

  // Check if the new Google Tabs feature is present in the environment
  if (typeof doc.getTabs === 'function') {
    const tabs = doc.getTabs();
    if (tabs && tabs.length > 0) {
      // Always target Tab 1 ("Active Tracker") so logs go to your main list
      return tabs[0].asDocumentTab().getBody();
    }
  }
  return doc.getBody();
}


// =====================
// Meal Entry
// =====================
function insertMealEntry() {
  const doc = DocumentApp.getActiveDocument();
  const body = getTargetBody();
  const cursor = doc.getCursor();
  

  const { dateString, timeString } = getCurrentDateTime();

  const template = buildMealTemplate(dateString, timeString);

  insertAtCursorOrEnd(body, cursor, template);
}

// =====================
// Meal Template Builder
// =====================
function buildMealTemplate(dateString, timeString) {
  return [
    PAGE_BREAK,

    H2(`Meal Entry — ${dateString} ${timeString}`),
    BLANK,

    P("Meal #:"),
    P("Entry Type: Meal"), 
    P("Meal category: Breakfast / Lunch / Dinner / Snack"),
    P(`Date: ${dateString}`),
    P(`Meal time (start/end): ${timeString} / _____`),
    BLANK,

    H3("Food"),
    P("Food & portions (be specific):"),
    BLANK,

    P("Carb type(s):", true),
    P("Total carbohydrates (if known):"),
    BLANK,

    P("Protein type(s):"),
    P("Protein at meal? (what/how much):"),
    CHECKBOX("Sauces/added fats:"),
    CHECKBOX("Fiber/vegetables included? (what):"),
    CHECKBOX("Caffeine/alcohol? (what/how much):"),
    BLANK,

    P("Cooking method:"),
    BLANK,

    P("Context / notes", true),
    P("Hunger/stress/exercise/illness/ate quickly or slowly (short notes):"),

    BLANK,
    PAGE_BREAK,

    H3("Dexcom Readings (start at meal time)"),
    P("────────────────────────────────"),
    P(" Dexcom Event Log (log at meal start in Dexcom app)"),
    P("────────────────────────────────"),
    
    P("Event name"),
    P("  e.g. Chicken sandwich + fries"),
    P(""),
    
    P("Meal type"),
    P("  Protein-heavy / Carb-heavy / Mixed / Snack / Restaurant"),
    P(""),
    
    P("Estimated carbs"),
    P("  Low (0–20g) / Medium (20–60g) / High (60g+)"),
    P(""),
    
    P("Notes (optional)"),
    P("  stress • illness • unusual hunger • alcohol • etc."),
    P(""),
    
    P("────────────────────────────────"),
    BLANK,
    BLANK,
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
// Wake Entry
// =====================
function insertWakeEntry() {
  const doc = DocumentApp.getActiveDocument();
  const body = getTargetBody();
  const cursor = doc.getCursor();

  const { dateString, timeString } = getCurrentDateTime();

  const template = [
    PAGE_BREAK,
    H2(`Wake Entry — ${dateString}`),
    BLANK,
    P("Entry Type: Wake"),
    P(`Date: ${dateString}`),
    P("Fasting glucose:"),
    P("Sleep quality (1–10):"),
    BLANK,

    H3("Night / Morning Context"),
    P("Last meal timing (approx):"),
    P(`Approximate  Wake Time: ${timeString}`),
    P("Sleep duration:"),
    P("Wake quality (groggy / normal / alert):"),
    BLANK,

    H3("Symptoms"),
    P("Any symptoms (headache, shaky, dizziness, etc.):"),
    BLANK,

    H3("Notes"),
    P("Anything unusual or relevant:"),
    BLANK,

    HR,
    BLANK
  ];

  insertAtCursorOrEnd(body, cursor, template);
}

// =====================
// Bedtime Entry
// =====================
function insertBedtimeEntry() {
  const doc = DocumentApp.getActiveDocument();
  const body = getTargetBody();
  const cursor = doc.getCursor();

  const { dateString, timeString } = getCurrentDateTime();

  const template = [
    PAGE_BREAK,

    H2(`Bedtime Entry — ${dateString} ${timeString}`),
    BLANK,

    P("Entry Type: Bedtime"),
    P(`Date: ${dateString}`),
    P("Current glucose:"),
    P("Trend before bed (Rising / Stable / Falling):"),
    BLANK,

    H3("Food / Activity Context"),
    P("Last meal (time + type):"),
    BLANK,

    H3("Physiological Context"),
    P("Alcohol / stress / illness (if any):"),
    P("Sleepiness level (1–10):"),
    BLANK,

    H3("Sleep Transition"),
    P("Bedtime routine / started winding down:"),
    P("Entered bed at:"),
    P("Estimated sleep start time:"),
    P("Awake after entering bed? Yes / No"),
    P("Approximate awake duration before sleep:"),
    BLANK,

    P("Sleep location(s):"),
    CHECKBOX("Bed"),
    CHECKBOX("Couch"),
    CHECKBOX("Other:"),
    BLANK,

    P("Moved locations overnight (if applicable):"),
    BLANK,

    P("CPAP use:"),
    CHECKBOX("Used CPAP for entire sleep period"),
    CHECKBOX("Used CPAP for part of sleep period"),
    CHECKBOX("Did not use CPAP"),
    P("Approximate CPAP start time:"),
    BLANK,

    H3("Overnight"),
    P("Sleep interruptions or movement:"),
    P("(e.g., awake periods, reading, bathroom, moved between bed and couch, etc.)"),
    BLANK,

    P("Any overnight concerns expected?"),
    BLANK,

    H3("Notes"),
    P("Anything unusual today:"),
    BLANK,

    HR,
    BLANK
  ];

  insertAtCursorOrEnd(body, cursor, template);
}
  
// =====================
// Sensor Change
// =====================
function insertSensorChange() {
  const doc = DocumentApp.getActiveDocument();
  const body = getTargetBody();
  const cursor = doc.getCursor();

  const now = new Date(); // for math
  const { dateString, timeString } = getCurrentDateTime(); // for UI

  const expiration = getSensorExpirationDate(now);

  const expDateString = Utilities.formatDate(
    expiration,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

const expTimeString = Utilities.formatDate(
  expiration,
  Session.getScriptTimeZone(),
  "h:mm a"
);

  const template = [
    PAGE_BREAK,

    H2(`Dexcom Sensor Change — ${dateString}`),
    BLANK,

    H3("Installation"),
    P("Entry Type: Sensor"),
    P(`Installed: ${dateString} ${timeString}`),
    P("Sensor Code:"),
    P(`Approximate Expiration: ${expDateString} ${expTimeString}`),
    BLANK,

    H3("Insertion"),
    P("Insertion Site:"),
    CHECKBOX("Any bleeding?"),
    CHECKBOX("Warm-up completed?"),
    BLANK,

    H3("Notes"),
    P("Anything unusual:"),
    BLANK,

    HR,
    BLANK
  ];

  insertAtCursorOrEnd(body, cursor, template);
}

// =====================
// Transmitter Change
// =====================
function insertTransmitterChange() {
  const doc = DocumentApp.getActiveDocument();
  const body = getTargetBody();
  const cursor = doc.getCursor();

  const now = new Date(); // for math
  const { dateString, timeString } = getCurrentDateTime(); // for UI

  const expiration = getTransmitterExpirationDate(now);

  const expDateString = Utilities.formatDate(
    expiration,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

  const expTimeString = Utilities.formatDate(
    expiration,
    Session.getScriptTimeZone(),
    "h:mm a"
  );

  const template = [
    PAGE_BREAK,

    H2(`Dexcom Transmitter Change — ${dateString}`),
    BLANK,
    P("Entry Type: Transmitter"),
    P(`Date: ${dateString}`),
    BLANK,
    H3("Installation"),
    P(`Installed: ${dateString} ${timeString}`),
    P(`Transmitter ID: `),
    P(`Replacement Due: ${expDateString} ${expTimeString}`),
    BLANK,

    H3("Reason"),
    BLANK,
    BLANK,

    HR,
    BLANK
  ];

  insertAtCursorOrEnd(body, cursor, template);
}

// =====================
// Date & Time Helper
// =====================
function getCurrentDateTime() {
  const now = new Date();
  const tz = Session.getScriptTimeZone();

  return {
    dateString: Utilities.formatDate(now, tz, "yyyy-MM-dd"),
    timeString: Utilities.formatDate(now, tz, "h:mm a")
  };
}

// ==========================
// Calculate Sensor Expiration
// ===========================
function getSensorExpirationDate(installDate) {
  const d = new Date(installDate);
  d.setDate(d.getDate() + 10);
  return d;
}

// ================================
// Calculate Transmitter Expiration
// ================================
function getTransmitterExpirationDate(installDate) {
  const d = new Date(installDate);
  d.setDate(d.getDate() + 90);
  return d;
}

// =============================
// Cursor Insert Helper (shared)
// =============================
function insertAtCursorOrEnd(body, cursor, template) {
  if (!cursor) {
    renderAtEnd(body, template);
    return;
  }

  let element = cursor.getElement();

  while (
    element &&
    element.getParent() &&
    element.getParent().getType() !== DocumentApp.ElementType.BODY_SECTION
  ) {
    element = element.getParent();
  }

  const index = body.getChildIndex(element);

  renderAtIndex(body, template, index);
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
    const p = index != null 
      ? body.insertParagraph(index, item.text) 
      : body.appendParagraph(item.text);
    
    if (item.bold) {
      p.setBold(true);
    } else {
      p.setBold(false); 
    }
    return p;
  }

  // Programmatic Checklist Generation
  else if (item.type === TYPE.CHECKBOX) {
    const textContent = "[ ]  " + item.text;
    const p = index != null 
      ? body.insertParagraph(index, textContent) 
      : body.appendParagraph(textContent);
    
    p.setLineSpacing(1.15); // Keeps standard text line height
    p.setSpacingAfter(0);     // Strips the large paragraph gap below the checkbox
    return p;
  }

  else if (item.type === TYPE.BLANK) {
    return index != null
      ? body.insertParagraph(index, "")
      : body.appendParagraph("");
  }

  else if (item.type === "page_break") {
  return index != null
    ? body.insertPageBreak(index)
    : body.appendPageBreak();
  }

  else if (item.type === TYPE.HR) {
    return index != null
      ? body.insertHorizontalRule(index)
      : body.appendHorizontalRule();
  }
}
