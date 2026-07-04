function onOpen() {
  DocumentApp.getUi()
    .createMenu("Meal Tracker")
    .addItem("Insert Meal Entry", "insertMealEntry")
    .addToUi();
}

function insertMealEntry() {
  const body = DocumentApp.getActiveDocument().getBody();
  
  const now = new Date();
  const tz = Session.getScriptTimeZone();

  const dateString = Utilities.formatDate(now, tz, "yyyy-MM-dd");
  const timeString = Utilities.formatDate(now, tz, "h:mm a");

  body.appendParagraph("Meal Entry")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph("");

  body.appendParagraph("Meal #: ");
  body.appendParagraph(`Date: ${dateString}`);
  body.appendParagraph(`Meal time (start): ${timeString}`);

  body.appendParagraph("");
  body.appendParagraph("Food")
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);

  body.appendParagraph("Food & portions (be specific):");
  body.appendParagraph("");

  body.appendParagraph("Protein at meal? (Y/N; what/how much):");
  body.appendParagraph("");

  body.appendParagraph("Carb type(s):");
  body.appendParagraph("Total carbohydrates (if known):");
  body.appendParagraph("");

  body.appendParagraph("Cooking method:");
  body.appendParagraph("");

  body.appendParagraph("Sauces/added fats:");
  body.appendParagraph("");

  body.appendParagraph("Fiber/vegetables included? (Y/N; what):");
  body.appendParagraph("");

  body.appendParagraph("Caffeine/alcohol? (Y/N; what/how much):");
  body.appendParagraph("");

  body.appendParagraph("Other notes:");
  body.appendParagraph("");

  body.appendParagraph("Dexcom Readings")
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);

  body.appendParagraph("Pre-meal glucose:");
  body.appendParagraph("30 min glucose:");
  body.appendParagraph("60 min glucose:");
  body.appendParagraph("90 min glucose:");
  body.appendParagraph("120 min glucose:");
  body.appendParagraph("Peak glucose:");
  body.appendParagraph("Peak time:");
  body.appendParagraph("Time above 180 mg/dL:");
  body.appendParagraph("Time below 70 mg/dL:");
  body.appendParagraph("Symptoms:");
  body.appendParagraph("");

  body.appendParagraph("Optional Notes")
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);

  body.appendParagraph("Anything unusual about this meal?");
  body.appendParagraph("");

  body.appendParagraph("Overall thoughts:");
  body.appendParagraph("");

  body.appendHorizontalRule();
}
