# Life Advisors — Daily Draw Calculator

Exported from The MCA Lifeline section “See what the daily draw means.” Includes its original calculation and supporting discussion cards. Adapted for reuse with scoped CSS/JavaScript, Reset, and input validation. The existing hosted site was not edited.

## Use with Cursor

1. Unzip this folder into a temporary reference folder inside your website project.
2. Open `preview.html` to review the working component.
3. Attach the HTML, CSS and JS files in Cursor. Paste `CURSOR-PROMPT.txt` into Agent chat. Tell Cursor which page should receive it if you have a specific placement in mind.

## Files

- `mca-daily-draw.html`: section markup (not a whole page).
- `mca-daily-draw.css`: styles scoped to #mca-daily-draw; adjust to your website's design.
- `mca-daily-draw.js`: browser-only interactions; load once with defer after the markup is available.
- `preview.html`: standalone local demo referencing the files above.
- `CURSOR-PROMPT.txt`: implementation instructions.

## Formula and behavior

Daily withdrawal percentage = total daily MCA withdrawals ÷ average daily revenue × 100. Both amounts should describe the same operating-day basis. Count of advances only personalizes the questions. Display is rounded; the bar caps at 100%. No data is sent or persisted by this component. Existing website analytics should also exclude the input values.

The descriptive messages at 25% and 50% are inherited from the source, not clinical or underwriting cutoffs. This illustration does not calculate profit, financing cost, eligibility or an outcome. Existing business options are retained.
