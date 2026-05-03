Build a mobile-first money tracker UI based on this concept:

Goal:
Create a simple Money In/Out tracker that feels like “I just remembered what I paid” instead of a traditional finance form.

Tech:
- React
- JavaScript only
- Material UI
- localForage for local storage
- No backend for now
- Keep code clean and easy to replace with DB later

Core UX:
- Mobile-first layout
- Clean pastel finance UI
- Soft cards, rounded corners, clear spacing
- Quick capture input instead of long forms
- Autocomplete suggestions from default values + saved entries
- User can still type custom values

Main Screen:
1. Header
   - Current month selector
   - Small calendar icon/button

2. Balance Card
   - Overall balance
   - Money in
   - Money out
   - Small visual accent/icon

3. Insights Card
   - Example: “You’re spending 18% less compared to last month.”
   - Keep as static/mock logic for now if needed

4. Recent Transactions
   - Group by Today / Yesterday / older date
   - Each row shows:
     - category/icon circle
     - title
     - payment method
     - amount with + or -
     - time/date
   - Income should be green
   - Expense should be red

5. Sticky Bottom Input
   - Rounded input bar at bottom
   - Placeholder: “What did you spend?”
   - Plus button on left
   - Optional mic icon on right, UI only
   - User can type natural text like:
     - `coffee 120`
     - `kfc 250 gcash`
     - `salary 20k`
     - `electric bill 1500`

Entry Flow:
- When user enters quick text and submits:
  1. Parse the text into transaction draft
  2. Show confirmation bottom sheet
  3. Allow user to confirm/save
  4. Optional note field
  5. Save to localForage

Parser Requirements:
- Detect amount from the text
- Support shorthand:
  - `20k` = 20000
  - `1.5k` = 1500
- Detect payment method if included:
  - cash
  - gcash
  - maya
  - bank
  - card
- Detect income keywords:
  - salary
  - income
  - freelance
  - allowance
  - bonus
- Default type is expense
- Remaining words become title

Default Suggestions:
Create default quick suggestions:
- Coffee ₱120 Cash
- Gas ₱500 GCash
- Grocery ₱1200 Cash
- KFC ₱250 GCash
- Electric Bill ₱1500 Bank
- Salary ₱20000 Bank Transfer

Autocomplete:
- Suggestions should appear while typing
- Suggestions should include default suggestions and previous saved titles
- Tapping a suggestion should fill the quick input or create draft

Data shape:
```js
{
  id: string,
  type: "in" | "out",
  title: string,
  amount: number,
  date: string,
  time: string,
  category: string,
  paymentMethod: string,
  note: string,
  rawText: string,
  createdAt: string
}

- Before editing, explain the planned file changes. Only modify files related to this feature. Do not refactor unrelated app code.