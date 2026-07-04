# Meal Tracker for Google Docs

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-JavaScript-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-green)

A Google Apps Script tool that adds a **Meal Tracker system inside Google Docs**.

It generates structured meal logs with automatic timestamps and is designed for tracking nutrition alongside CGM data (e.g., Dexcom).

This project turns a Google Doc into a lightweight personal health logging system.

---

## Why this exists

Most nutrition tracking tools are either:
- too heavy (apps with accounts, dashboards, etc.)
- too rigid (limited customization)
- disconnected from personal workflow

This project integrates directly into Google Docs, allowing fast, flexible logging without leaving your writing environment.

## Project Overview

### Source Code (GitHub)
https://github.com/jschwarzwalder/meal-tracker-google-docs-

### Apps Script Project
https://script.google.com/home/projects/1-NSvFGW8RUkGKdfPGDTA3j2KusTfoU27pTpkpnizcCoAJ4Hy3px7LzNB

### Apps Script Project ID
`1-NSvFGW8RUkGKdfPGDTA3j2KusTfoU27pTpkpnizcCoAJ4Hy3px7LzNB`

This project is maintained in GitHub and deployed via Google Apps Script.

## Screenshots

### Meal Tracker Menu
![Menu Screenshot](./screenshot/menu.png)

### Inserted Meal Entry
![Meal Entry Screenshot](./screenshot/sample-entry.png)

---

## Features

* Adds a **Meal Tracker** menu to Google Docs.
* Inserts a complete meal entry template with one click.
* Automatically fills in the current date.
* Automatically fills in the current time.
* Inserts the template at the current cursor position.
* Organized sections for:

  * Meal information
  * Food details
  * Macronutrients
  * Cooking methods
  * Fiber and vegetables
  * Caffeine and alcohol
  * Dexcom/CGM readings
  * Optional notes

## Example

```text
Meal Entry

Meal #:
Date: 2026-07-03
Meal time (start): 7:35 PM

Food

Food & portions (be specific):

Protein at meal? (Y/N; what/how much):

Carb type(s):
Total carbohydrates (if known):

Cooking method:

Sauces/added fats:

Fiber/vegetables included? (Y/N; what):

Caffeine/alcohol? (Y/N; what/how much):

Other notes:

Dexcom Readings

Pre-meal glucose:
30 min glucose:
60 min glucose:
90 min glucose:
120 min glucose:
Peak glucose:
Peak time:
Time above 180 mg/dL:
Time below 70 mg/dL:
Symptoms:

Optional Notes

Anything unusual about this meal?

Overall thoughts:
```

## Installation

1. Open a Google Doc.
2. Select **Extensions → Apps Script**.
3. Replace the default `Code.gs` contents with the script from this repository.
4. Save the project.
5. Reload the Google Doc.
6. Authorize the script the first time you run it.

After installation, you'll see a new **Meal Tracker** menu in the document.

## Usage

1. Place your cursor where you want the meal entry inserted.
2. Click **Meal Tracker → Insert Meal Entry**.
3. The template will be inserted with the current date and time already filled in.

## Linting

This project is written in Google Apps Script, which uses JavaScript but also provides built-in global objects such as `DocumentApp`, `Session`, and `Utilities`. Because of this, standard JavaScript linters may report false "undefined variable" errors unless those globals are declared.

For a quick syntax and style check without installing any tools locally, use the **ESLint Playground**:

**ESLint Playground:**
[https://eslint.org/play/](https://eslint.org/play/?utm_source=chatgpt.com)

Before pasting the script into the playground, add the following comment at the top of the file so ESLint recognizes the Apps Script globals:

```javascript
/* global DocumentApp, Session, Utilities */
```

The playground is useful for catching common JavaScript issues such as:

* Syntax errors
* Undefined variables
* Unused variables
* Unreachable code
* General code quality and style issues

Keep in mind that the playground does **not** understand the Google Apps Script runtime, so it cannot validate Apps Script-specific APIs or behavior. Always test the script in Google Apps Script after making changes.


## Future Ideas

* Automatic meal numbering
* Custom date and time formats
* Checkboxes for Yes/No fields
* Sidebar entry form
* Export to CSV
* Integration with Google Sheets
* CGM data import
* Nutrition analysis

## Contributing

Pull requests, bug reports, and feature suggestions are welcome. If you have ideas for improving the workflow or adding new tracking capabilities, feel free to open an issue.

## License

This project is licensed under the MIT License.
