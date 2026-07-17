# Test Plan — Diabetes Meal Logging Assistant (While Eating Mode)

**Validated against:** Prompt v1.5 / Meal Template v1.6 (2026-07-16)

## Purpose

Validate that the meal logging prompt correctly interprets **natural, conversational input** — the way you'd actually type while eating — and correctly enforces:

- Minimum-necessary-questions behavior
- Nutrition Authority Rules (authoritative facts vs. the estimate yes/no flow)
- Event Name construction (confirmed foods only, no inferred ingredients)
- Dexcom Event Log classification (5-way Meal Type, 3-way Estimated Carbs)
- Scheduled Glucose Checks vs. actual Dexcom readings
- The standalone pre-meal glucose question
- Photo mode (Visible vs. Uncertain)
- Nutrition provided via photo, pasted chart, or link
- Update-existing-entry behavior (no duplicates)
- Strict completion-phrase gating

## Preconditions

- Use the **While Eating Mode** prompt.
- Never invent nutrition or glucose values.
- No completed log until one of the exact completion phrases is given:
  **"Ready for log" / "All information provided" / "Ready" / "Log it" / "Ready for completed log."**
- Inputs should read like real, casual notes typed mid-meal — not structured data dumps.

## Global Pass/Fail Criteria

A run **fails** if any of the following occur:

- A completed log is produced before a valid completion phrase is given.
- Carbs/protein/fat/fiber are estimated without the yes/no estimate flow.
- Nutrition facts the user *did* provide get recalculated, rescaled, or added to.
- Glucose values are invented or appear outside the Dexcom Readings fields.
- Scheduled Glucose Checks appear when Dexcom readings *were* provided, or are missing when they weren't.
- The standalone pre-meal glucose question isn't asked when no readings exist.
- Meal Type is anything other than the single correct value for the scenario (see rules below).
- Estimated Carbs bucket doesn't match Total Carbohydrates.
- Event Name includes an ingredient (sauce, oil, garnish) that wasn't explicitly confirmed as eaten, even if it appeared in the dish's full name.
- A photo case skips the Visible/Uncertain split, or estimates nutrition before required details are known.
- An update to an existing entry creates a duplicate instead of updating in place.
- More than the minimum necessary clarifying questions are asked.

### Meal Type decision order (per prompt)
1. **Snack** — if I identify the entry as a snack, regardless of carb/protein ratio.
2. **Restaurant** — if the meal was purchased/prepared at a restaurant.
3. **Mixed** — if both protein and carbs are meaningful parts of the meal (and not already Snack/Restaurant).
4. **Protein-heavy** — protein ≈ 50%+ of carb amount.
5. **Carb-heavy** — carbs substantially exceed protein.

---

## Section A — Core Behavior (natural phrasing)

### A1. Breakfast with no quantities given
**Input:**
> "I'm having eggs and bacon for breakfast"

**Expect:** Assistant asks only for missing quantities (how many eggs, how much bacon) — plus, per the template, may reasonably ask about sides/drinks/sauces/cooking fat. No log yet.

**Follow-ups:**
> "Two slices of bacon"
> "One egg, cooked in the same pan after the bacon"
> "Just had some water with it"
> "Sat down to eat around 8"
> "No exact nutrition numbers, go ahead and estimate"
> "Ready for log"

**Expect (completed log):**
- Nutrition fields are populated and clearly labeled **Estimated** (no label/lab numbers were given).
- **Meal Type = Protein-heavy**, **Estimated Carbs = Low (0–20g)** — bacon and eggs with no sides should land here regardless of the exact numbers the assistant estimates, since carbs stay minimal and protein dominates.
- Pre-meal glucose was asked for (or Scheduled Glucose Checks generated), since no Dexcom data was given.

**Validate:** No log until completion phrase; the estimate flow (not silent guessing) is what produces the nutrition numbers used for classification.

---

### A2. Lunch, nutrition already known — completion phrase variant
**Input:**
> "Having a chicken taco bowl for lunch — it's 62g carbs, 35g protein"
>
> "All information provided"

**Expect:** Assistant treats 62g/35g as authoritative (no recalculation), completes the log using a non-default completion phrase.

**Expect (completed log):**
- **Estimated Carbs = High (60g+)** — 62g crosses the 60g threshold.
- **Meal Type — boundary case:** protein (35g) is ~56% of carbs (62g), which technically clears the "50%+" Protein-heavy threshold. But at 62g carbs (High bucket) with both macros individually substantial, this could also read as **Mixed**. The prompt doesn't fully disambiguate the overlap between "protein ≥50% of carbs" and "both are meaningful parts of the meal." Check which way your assistant resolves it and decide whether that matches your intent — don't treat a "wrong" answer here as an automatic bug without checking the other one first.

**Validate:** Confirms the assistant recognizes completion phrases other than "Ready for log," and surfaces how it resolves the Protein-heavy/Mixed overlap.

---

### A3. Snack, portion known but no nutrition info
**Input:**
> "Just had a cup of 2% milk as a snack"

**Expect:** Assistant asks: *"Do you want me to estimate nutrition for this meal? (yes/no)"*

**Follow-ups:**
> "Yes, go ahead and estimate"
> "Ready for log"

**Expect (completed log):**
- Nutrition is labeled **Estimated**.
- **Meal Type = Snack** — explicitly identified as a snack, overriding whatever the carb/protein ratio would otherwise suggest.
- **Estimated Carbs = Low (0–20g)** — one cup of 2% milk typically estimates to roughly 12g carbs, though the exact bucket should be checked against whatever number the assistant actually produces.

**Validate:** "Yes" -> nutrition labeled **Estimated** and classification fields filled in as above. "No" -> carbs/protein fields stay blank, and Meal Type/Estimated Carbs are left blank too (per the prompt, these are only mandatory "when known").

---

### A4. Starbucks order, vague milk amount + food item (Restaurant meal type)
**Input:**
> "Grabbed a grande iced coffee from Starbucks, just a splash of skim milk in it, and a bacon gouda egg bite"

**Expect:** Assistant asks only for the milk amount (the egg bite is a defined menu item, so it shouldn't need clarification on its own) — then, if nutrition still isn't known for either item, the estimate yes/no question per Example F. Restaurant nutrition should only be used once required customization details are known.

**Follow-ups:**
> "About an ounce of milk"
> "Sure, go ahead and estimate"
> "Ready for log"

**Expect (completed log):**
- Food & portions includes both the drink and the egg bite — nothing is dropped just because one item (the drink) needed clarification.
- Nutrition labeled **Estimated**.
- **Meal Type = Restaurant** — this should hold regardless of the estimated carb/protein numbers, since Restaurant is purchase-based, not ratio-based.
- **Estimated Carbs:** likely **Low–Medium** for a coffee + egg bite combo — verify the bucket matches whatever total the assistant actually estimates.

**Validate:** No sauces/toppings are added to the egg bite beyond what was stated.

---

### A5. Meal start time missing AM/PM
**Input:**
> "Turkey sandwich with lettuce and tomato for lunch, started eating around 2. Carbs were about 45g, protein was 15g."

**Expect:** Assistant asks only for AM/PM — food and nutrition were already fully specified.

**Follow-up:**
> "2pm"
>
> "Ready for log"

**Expect (completed log):**
- **Meal Type = Carb-heavy** (protein 15g is well under 50% of 45g carbs).
- **Estimated Carbs = Medium (20–60g)**.
- Scheduled Glucose Checks (no Dexcom was given) anchor to 2:00 PM: 2:30 / 3:00 / 3:30 / 4:00 PM.

**Validate:** Exactly one clarifying question (AM/PM) — nothing else, since everything else was already provided.

---

### A6. Restaurant meal with Dexcom already provided

**Input:**
> "Grabbed a burrito bowl from Chipotle for lunch, started around 12:30. Carbs were about 70g, protein was 30g. Dexcom's been reading 115 before, then 145, 165, 155, 140 at 30/60/90/120, peaked around 170 at the hour mark."
>
> "Ready for log"

**Expect (completed log):**
- Scheduled Glucose Checks **omitted** (Dexcom readings were provided); Dexcom Readings populated exactly as given.
- **Meal Type = Restaurant** — even though carbs (70g) substantially exceed protein (30g), which would otherwise suggest Carb-heavy, Restaurant takes priority since it was purchased there.
- **Estimated Carbs = High (60g+)**.

**Validate:** Confirms Restaurant classification wins over the carb/protein ratio rule, the same way B2 confirmed Snack wins over it.

---

## Section B — Dexcom Event Log Classification

### B1. Low carbs -> Protein-heavy
**Input:**
> "Breakfast was bacon and eggs, sat down around 8am. Carbs were like 5g, protein was 25g. Dexcom was 110 before eating, then 140, 160, 150, 130 at 30/60/90/120 — peaked at 165 around the hour mark."
>
> "Ready for log"

**Expect:** Meal Type = **Protein-heavy**, Estimated Carbs = **Low (0–20g)**, no Scheduled Glucose Checks.

---

### B2. Medium carbs, identified as a snack -> Meal Type = Snack (not Carb-heavy)
**Input:**
> "Had a snack, glass of milk, around 1pm. About 35g carbs, 10g protein. Dexcom's at 105 before, 130/155/145/135 at 30/60/90/120, peaked around 170 at the hour mark."
>
> "Ready for log"

**Expect:** Because this was identified as a **snack**, Meal Type = **Snack**, not Carb-heavy, even though carbs substantially exceed protein. Estimated Carbs = **Medium (20–60g)**.

**Why this matters:** the Snack rule takes priority over the carb/protein ratio rule — this is the most likely place for a classification bug.

---

### B3. High carbs, dinner -> Carb-heavy
**Input:**
> "Dinner was chicken alfredo and some garlic bread, started around 7:30pm. Carbs came out to about 95g, protein was 25g. Dexcom: 120 before, 160/190/175/160 at 30/60/90/120, peak of 205 around the hour mark."
>
> "Ready for log"

**Expect:** Meal Type = **Carb-heavy**, Estimated Carbs = **High (60g+)**. Food section lists only chicken alfredo and garlic bread — no inferred sauces/sides.

---

### B4. Both protein and carbs meaningful, not a snack or restaurant -> Mixed
**Input:**
> "Dinner was grilled chicken with a big side of rice and veggies, started around 6:45. Carbs were about 50g, protein was 22g."
>
> "Ready for log"

**Expect:** Protein (22g) is ~44% of carbs (50g) — under the 50% Protein-heavy threshold, so that rule doesn't fire. But 22g of protein is still a meaningful amount for a dinner, not trivial, so this isn't a clean "carbs substantially exceed protein" case either. Since it's also a home-cooked dinner (not a snack, not a restaurant), **Meal Type = Mixed** is the intended read. **Estimated Carbs = Medium (20–60g)**.

**Validate:** This is the least-tested branch, and it's also a legitimate boundary case — a stricter reading of "substantially exceed" could argue Carb-heavy instead, since carbs are still ~2.3x protein. Either answer is defensible; the useful thing to check is that your assistant is consistent about where it draws that line across similar meals, not just that it picks one specific label here.

---

### B5. No Dexcom provided -> Scheduled Glucose Checks + standalone pre-meal glucose question
**Input:**
> "Snack around 3:15, just a glass of milk — about 20g carbs, 10g protein"

**Expect (before completion):** Since no Dexcom data was given, assistant asks: *"What is your pre-meal glucose?"* (Step 8), separate from the scheduling logic.

**Follow-up:**
> "It was 98"
>
> "Ready for log"

**Expect (completed log):**
- Meal Type = **Snack**, **Estimated Carbs — boundary case:** 20g sits exactly on the line between the prompt's own overlapping thresholds ("Low (0–20g)" and "Medium (20–60g)" both list 20g). Either bucket is a defensible read until you decide which end 20g rounds to — worth checking your assistant is at least consistent about it rather than flipping between runs.
- Pre-meal glucose = 98 (as given).
- **Scheduled Glucose Checks present**, anchored to 3:15 PM (3:45 / 4:15 / 4:45 / 5:15 PM).
- 30/60/90/120 min Dexcom Reading fields stay blank (not invented).

---

## Section C — Event Name & Ingredient Confirmation

> Note: the prompt's own Example G already walks through "quesadilla with pork dumpling filling and yuzu aioli" verbatim — testing that exact combo would mostly confirm the assistant can recall a worked example, not that it applies the underlying rule to something new. Both cases below use different dishes for that reason.

### C1. Descriptive dish name vs. confirmed ingredients
**Input:**
> "Had a fish taco with chipotle crema and pickled slaw for dinner"
>
> "Ready for log"

**Expect:**
- **Food & portions:** "Fish taco with chipotle crema and pickled slaw" (kept as the meal description).
- **Event name:** "Fish taco with pickled slaw" — crema is *not* carried into the event name.
- **Sauces/added fats:** left blank unless explicitly confirmed as eaten.

**Follow-up variant to also test:**
> "No, I actually wiped most of the crema off — didn't really eat it"

**Expect:** Sauces/added fats and Event Name stay exactly as the default case (crema excluded) — confirms an explicit "no" produces the same result as staying silent, rather than the assistant second-guessing itself or leaving a partial/uncertain note about the crema.

---

### C2. Sauce excluded from the start ("hold the sauce")
**Input:**
> "Got a burger with garlic aioli on it, but I asked them to hold the aioli so it never came with any"

**Expect:**
- **Food & portions:** "Burger" — the aioli isn't part of what was actually served, so unlike C1 it shouldn't even appear in the meal description as something present-but-unconfirmed.
- **Event name:** "Burger" — no aioli reference at all.
- **Sauces/added fats:** blank.
- Assistant does not ask a clarifying "did you eat the aioli?" question, since the input already establishes it was never on the plate.

**Validate:** This is a different failure mode than C1 — here the risk is the assistant pattern-matching "burger with garlic aioli" as the dish name and carrying the aioli through anyway, missing the "hold" instruction entirely.

---

## Section D — Photo Mode

### D1. Photo with mixed visible/uncertain foods
**Input:**
> [photo: https://github.com/jschwarzwalder/meal-tracker-google-docs-/blob/main/docs/example-meal.jpg — sausage links, mashed potatoes, and a side salad]
> "Here's my dinner"

**Expect:**
- Assistant separates output into **Visible** (sausage, mashed potatoes, side salad with greens and tomato) and **Uncertain** (e.g., the butter/pat melting on the potatoes, any salad dressing, seasoning on the sausage — none of which can be confirmed just from the image).
- Follow-up questions asked for portions, ingredients, sauces/dressing, and cooking method.
- No nutrition estimate is offered/made until those details are resolved.

**Validate:** Nutrition estimate question is not asked prematurely — required details must be gathered first per Step 6. The butter and dressing specifically should land in Uncertain, not get silently assumed into Sauces/added fats.

---

## Section E — Updating an Existing Entry

### E1. New Dexcom data for a prior meal
**Setup:** A completed entry already exists: "Meal Entry 2026-07-15 9:00 PM."

**Input:**
> "New Dexcom numbers came in for that 9pm meal — 60 min was 175, 90 min was 150"

**Expect:** Assistant updates the existing 9:00 PM entry's Dexcom Readings fields rather than creating a second, duplicate entry for the same meal.

**Validate:** Only one entry exists for 2026-07-15 9:00 PM after the update.

---

## Section F — Nutrition Provided in Different Formats

The prompt's Nutrition Authority Rules say provided facts are authoritative "from a label, restaurant information, meal kit, or my own calculation" — but it doesn't spell out how that applies when the source isn't typed text. These three cases check the formats you actually use.

### F1. Nutrition label via photo/screenshot
**Input:**
> "Having a glass of skim milk with breakfast"
> [photo: https://github.com/jschwarzwalder/meal-tracker-google-docs-/blob/main/docs/example-milk.jpg — Market Pantry Skim Milk nutrition facts panel. Confirmed label values: Serving Size 1 cup (240mL), Calories 90, Total Fat 0g, Total Carbohydrate 13g, Dietary Fiber 0g, Sugars 12g, Protein 8g]

**Follow-up:**
> "Ready for log"

**Expect (completed log):**
- Carb/protein values are read from the image and used **exactly as shown** (13g carb, 8g protein) — no recalculation, no rounding, no added fields (e.g. don't invent a fiber value beyond the printed 0g).
- **Meal Type = Protein-heavy** (8g protein is ~62% of 13g carbs — dairy often lands here, which is a good sanity check that the assistant is doing the ratio math rather than assuming "milk = carb-heavy").
- **Estimated Carbs = Low (0–20g)**.
- No estimate yes/no question is asked — a readable label counts as provided nutrition facts, same as if you'd typed the numbers.

**Validate:** If part of the label is blurry/out of frame, the assistant asks for just that missing value rather than guessing it — reading a photo doesn't waive the "don't estimate silently" rule for whatever isn't actually legible.

---

### F2. Full nutrition chart pasted as text
**Input:**
> "Snack — granola bar. Here's the label: Calories 210, Total Fat 7g, Saturated Fat 2g, Total Carbohydrate 32g, Dietary Fiber 4g, Total Sugars 11g, Protein 6g"
>
> "Ready for log"

**Expect (completed log):**
- Classification uses **Total Carbohydrate (32g)** specifically — not Total Sugars (11g) — for the Estimated Carbs bucket. **Estimated Carbs = Medium (20–60g)**.
- **Meal Type = Snack** — identified as a snack, which overrides what the ratio alone would suggest (protein 6g is only ~19% of carbs, which would otherwise read as Carb-heavy).
- Dietary Fiber (4g) populates the Fiber field directly since it was explicitly given; fields with no template slot (Calories, Saturated Fat) are simply not carried into fields that don't exist for them — not dropped as "missing," just not applicable.

**Validate:** This is the case most likely to catch a classification bug — confirm the assistant pulls the right line out of a multi-line chart instead of grabbing the first carb-looking number it sees (Total Sugars).

---

### F3. Nutrition info provided as a link only
**Input:**
> "Here's the nutrition info for my lunch: [link to a restaurant menu item's nutrition page] — no numbers pasted, no photo"

**Expect — depends on whether the assistant can actually access the link:**
- **If it can fetch and read the page:** treat the retrieved values as authoritative, same as a pasted chart, and it's reasonable to note the source.
- **If it can't fetch the link** (no browsing in this context, page blocked, etc.): it should say so and ask you to paste the values or send a screenshot — it must **not** fill in "typical" numbers for that menu item from memory and present them as if they came from the link.

**Validate:** This is the one to watch closely. A link with no other detail is the easiest place for the assistant to quietly substitute a remembered or guessed figure while implying it's authoritative. If that happens, it's not just a missed clarification — it's an invented value bypassing the estimate flow entirely, since it wasn't run through the "Do you want me to estimate? (yes/no)" question or labeled **Estimated**.

---

## Summary Table

| # | Focus | Dexcom Given? | Expected Meal Type | Expected Estimated Carbs | Key Behavior Checked |
|---|-------|----------------|---------------------|----------------------------|------------------------|
| A1 | Missing quantities, then estimate flow | No | Protein-heavy | Low (0–20g), estimated | Minimal clarifying questions; estimate flow drives classification |
| A2 | Known nutrition + alt completion phrase | -- | Protein-heavy *(boundary case — could read as Mixed)* | High (60g+) | Authoritative facts; non-default completion phrase; ratio/bucket overlap |
| A3 | No nutrition info, then estimate flow | -- | Snack | Low (0–20g), estimated | Estimate yes/no flow; Snack override |
| A4 | Vague portion + food item, Starbucks | -- | Restaurant | Low–Medium, estimated | Minimal question; Restaurant override |
| A5 | Ambiguous time, food/nutrition given | No | Carb-heavy | Medium (20–60g) | Exactly one AM/PM clarification |
| A6 | Restaurant + Dexcom provided | Yes | Restaurant | High (60g+) | Restaurant override with real glucose data |
| B1 | Low carb | Yes | Protein-heavy | Low (0–20g) | Ratio-based classification |
| B2 | Medium carb, snack | Yes | Snack | Medium (20–60g) | Snack override beats ratio |
| B3 | High carb, dinner | Yes | Carb-heavy | High (60g+) | Ratio-based classification |
| B4 | Balanced protein/carbs, home dinner | No | Mixed *(boundary case — could read as Carb-heavy)* | Medium (20–60g) | Mixed doesn't default to Carb-heavy |
| B5 | No Dexcom | No | Snack | Medium (20–60g) *(boundary case — 20g sits on the prompt's own Low/Medium overlap)* | Scheduled checks + standalone pre-meal glucose question |
| C1 | Dish name vs. confirmed ingredients | -- | N/A (no nutrition given) | N/A | Event Name excludes unconfirmed sauce |
| C2 | Sauce held from the start | -- | N/A (no nutrition given) | N/A | Event Name never picks up a sauce that was never served |
| D1 | Photo | No | N/A (details pending) | N/A | Visible/Uncertain split, no premature estimate |
| E1 | Update existing entry | Partial | N/A (no reclassification) | N/A | Updates in place, no duplicate |
| F1 | Nutrition via photo/screenshot | -- | Protein-heavy | Low (0–20g) | Values read from image, treated as authoritative |
| F2 | Full chart pasted as text | -- | Snack | Medium (20–60g) | Correct field pulled from multi-line chart; Snack override |
| F3 | Nutrition via link only | -- | N/A (depends on fetch outcome) | N/A | No silently guessed values if the link can't be read |
