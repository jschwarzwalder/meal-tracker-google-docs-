function onOpen() {
  DocumentApp.getUi()
    .createMenu("Meal Tracker")
    .addItem("Insert Meal Entry", "insertMealEntry")
    .addToUi();
}

// ---------- Helpers ----------
const H2 = text => ({ type: "h2", text });
const H3 = text => ({ type: "h3", text });
const P = text => ({ type: "p", text });
const BLANK = { type: "blank" };
const HR = { type: "hr" };

// ---------- Main Function ----------
function insertMealEntry() {
  const body = DocumentApp.getActiveDocument().getBody();

  const now = new Date();
  const tz = Session.getScriptTimeZone();

  const dateString = Utilities.formatDate(now, tz, "yyyy-MM-dd");
  const timeString = Utilities.formatDate(now, tz, "h:mm a");

  const template = [
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

  renderTemplate(body, template);
}

// ---------- Renderer ----------
function renderTemplate(body, template) {
  template.forEach(item => {
    switch (item.type) {
      case "h2":
        body.appendParagraph(item.text)
          .setHeading(DocumentApp.ParagraphHeading.HEADING2);
        break;

      case "h3":
        body.appendParagraph(item.text)
          .setHeading(DocumentApp.ParagraphHeading.HEADING3);
        break;

      case "p":
        body.appendParagraph(item.text);
        break;

      case "blank":
        body.appendParagraph("");
        break;

      case "hr":
        body.appendHorizontalRule();
        break;
    }
  });
}
