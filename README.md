# 💸 Split-App Backend

A backend service to track shared expenses and calculate the fairest settlement for a group—similar to **Splitwise** or **Google Pay Bill Split**.  
Built with **Node.js + Express**, stores data in **MongoDB Atlas**, and is deployed free on **Railway.app**.

---

## 1 · Tech Stack

| Layer            | Tool / Service                     | Why?                                       |
| ---------------- | ---------------------------------- | ------------------------------------------ |
| Runtime          | **Node.js 18 LTS**                 | Lightweight, huge ecosystem                |
| Framework        | **Express 5**                      | Minimal, unopinionated HTTP routing        |
| Database         | **MongoDB Atlas (M0 free tier)**   | Flexible schema for variable splits        |
| ODM              | **Mongoose**                       | Schema validation & easy queries           |
| Deployment       | **Railway.app**                    | 1-click GitHub deploy, free HTTPS URL      |
| API Testing      | **Postman**                        | Manual & automated request collections     |

---

---
## Types of Splitting supported 

| `type` value | How the backend interprets it                        | Example in the `shares` array                               |
| ------------ | ---------------------------------------------------- | ----------------------------------------------------------- |
| `equal`      | Each listed person owes an equal share of the total. | `{ "person": "Om", "type": "equal" }`                       |
| `percentage` | Each person owes `value %` of the total.             | `{ "person": "Sanket", "type": "percentage", "value": 40 }` |
| `exact`      | Each person owes the exact rupee amount in `value`.  | `{ "person": "Shantanu", "type": "exact", "value": 250 }`   |

---
## 2 · Live Demo

| Environment | Base URL |
| ----------- | -------- |
| **Prod**    | `https://split-app-backend-production-c593.up.railway.app` |

> Use that URL as `{{base_url}}` in Postman.

---

## 3 · Postman Collection

| Link | Contents |
| ---- | -------- |
| **Public Gist** | <https://gist.github.com/rushabhrode/93a30add11f356e79d8c5120ea8d3d95> |

**Folders included**

1. **Expense Management** – add / list / update / delete  
2. **People & Balances** – auto-derived participants & net balances  
3. **Settlements** – optimized “who pays whom” list  
4. **Edge-Cases** – negative amount, missing fields, 404 checks

---

## 4 · Local Setup (Development)

> Tested on Windows 11 & macOS 14 with Node 18.

### 4.1  Clone + Install
```bash
git clone https://github.com/rushabhrode/split-app-backend.git
cd split-app-backend
npm install
```

### 4.2 · Environment Variables  
Create a `.env` file in the project root:

```env
MONGO_URI=<mongo atlas url>
PORT=3000
```

### 4.3 · Run (dev mode with nodemon)

```bash
npm run dev
# → ✅  MongoDB connected
#   🚀  Server listening on port 3000
```

## 5 · Deployment on Railway (Quick Guide)

1. **Push code** to a public GitHub repository.  
2. Log in to **Railway.app** → **New Project** → **Deploy from GitHub**.  
3. In the **Variables** tab, add:  
   - `MONGO_URI` – `mongo atlas url`  
   - `PORT` – `3000`  
4. Click **Deploy** – Railway will build, install dependencies, and serve the app at a URL like  
   `https://split-app-backend-production-c593.up.railway.app`.  
5. Copy that domain and set it as `{{base_url}}` in your Postman environment.


## 6 · API Reference

### 6.1 · Expense Management

| Method | Endpoint        | Description             | Success |
| ------ | --------------- | ----------------------- | ------- |
| GET    | `/expenses`     | List all expenses       | 200 OK  |
| POST   | `/expenses`     | Add a new expense       | 201 Created |
| PUT    | `/expenses/:id` | Update an expense       | 200 OK  |
| DELETE | `/expenses/:id` | Delete an expense       | 204 No Content |

<details>
  <summary>💡 Sample <code>POST /expenses</code></summary>


POST /expenses
Content-Type: application/json

```json
{
  "amount": 600,
  "description": "Dinner at restaurant",
  "paid_by": "Shantanu",
  "shares": [
    { "person": "Shantanu", "type": "equal" },
    { "person": "Sanket",   "type": "equal" },
    { "person": "Om",       "type": "equal" }
  ]
}
```
</details>

### 6.2 · Group Insights

| Method | Endpoint          | Description                                                   |
| ------ | ---------------- | ------------------------------------------------------------- |
| GET    | `/people`        | All unique participants (payer + shares)                      |
| GET    | `/balances`      | Net balance per person (positive = owed money)                |
| GET    | `/settlements`   | Minimal transactions required to settle all outstanding debt |

---

## 7 · Business Logic

### 7.1 · `calculateBalances(expenses)`
1. Add the **total amount** of each expense to the payer’s balance.  
2. Subtract each participant’s **fair share** (supports `equal`, `percentage`, or `exact`).  
3. **Round** every balance to two decimals.

### 7.2 · `calculateSettlements(balances)`
1. Split balances into **creditors** (positive) and **debtors** (negative).  
2. Sort creditors descending, debtors ascending.  
3. Greedily match the largest creditor with the largest debtor → **fewest payments**.  
4. Output an array of transactions:  
   ```json
   [{ "from": "Debtor", "to": "Creditor", "amount": 42.50 }, ...]
```

## 8 · Validation & Error Handling

| Scenario                              | HTTP Status | JSON Key   |
| ------------------------------------- | ----------- | ---------- |
| Missing or negative **amount**        | **400**     | `errors[]` |
| Empty **description** or **paid_by**  | **400**     | `errors[]` |
| Invalid share **type** or **value**   | **400**     | `errors[]` |
| Expense ID **not found**              | **404**     | `message`  |
| Uncaught server/database failure      | **500**     | `message`  |

**Consistent response wrapper**

```json
{
  "success": <boolean>,
  "data":    <payload?>,
  "message": <string?>,
  "errors":  <array?>
}
```
## 9 · Assumptions & Limitations

- **Case-sensitive names** – `"om"` and `"Om"` are treated as different people.  
- **Single-currency** system – no foreign-exchange conversion.  
- **Public API** – no authentication or user accounts.  
- **Floating-point values** are rounded to **2 decimals** for all money calculations.

## 10 · Project Structure

```plaintext
src/
├─ app.js
├─ models/
│  └─ Expense.js
├─ routes/
│  ├─ expenses.js
│  └─ settlements.js
├─ utils/
│  └─ settlementCalculator.js
└─ package.json
```

## 11 · SChecklist ✅

- **GitHub repo** – <https://github.com/rushabhrode/split-app-backend>  
- **Railway deploy** – <https://split-app-backend-production-c593.up.railway.app>  
- **Public Postman collection** – <https://gist.github.com/Rushabh2004/split-app-postman-collection>  
- Sample seed data included *(Shantanu, Sanket, Om)*  
- This **detailed README** file

---

## 12 · Contact

Need help running the backend or reviewing the API?  
Open an issue on GitHub or ping **@rushabhrode**.  
