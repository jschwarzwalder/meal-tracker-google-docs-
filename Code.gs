function insertMealEntry() {
  const body = DocumentApp.getActiveDocument().getBody();

  const now = new Date();
  const tz = Session.getScriptTimeZone();

  const dateString = Utilities.formatDate(now, tz, "yyyy-MM-dd");
  const timeString = Utilities.formatDate(now, tz, "h:mm a");

  const template = [
    {
      text: "Meal Entry",
      heading: DocumentApp.ParagraphHeading.HEADING2
    },
    "",

    "Meal #:",
    `Date: ${dateString}`,
    `Meal time (start): ${timeString}`,
    "",

    {
      text: "Food",
      heading: DocumentApp.ParagraphHeading.HEADING3
    },

    "Food & portions (be specific):",
    "",

    "Protein at meal? (Y/N; what/how much):",
    "",

    "Carb type(s):",
    "Total carbohydrates (if known):",
    "",

    "Cooking method:",
    "",

    "Sauces/added fats:",
    "",

    "Fiber/vegetables included? (Y/N; what):",
    "",

    "Caffeine/alcohol? (Y/N; what/how much):",
    "",

    "Other notes:",
    "",

    {
      text: "Dexcom Readings",
      heading: DocumentApp.ParagraphHeading.HEADING3
    },

    "Pre-meal glucose:",
    "30 min glucose:",
    "60 min glucose:",
    "90 min glucose:",
    "120 min glucose:",
    "Peak glucose:",
    "Peak time:",
    "Time above 180 mg/dL:",
    "Time below 70 mg/dL:",
    "Symptoms:",
    "",

    {
      text: "Optional Notes",
      heading: DocumentApp.ParagraphHeading.HEADING3
    },

    "Anything unusual about this meal?",
    "",

    "Overall thoughts:",
    ""
  ];

  template.forEach(item => {
    if (typeof item === "string") {
      body.appendParagraph(item);
    } else {
      body.appendParagraph(item.text)
          .setHeading(item.heading);
    }
  });

  body.appendHorizontalRule();
}
