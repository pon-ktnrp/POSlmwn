# Full-Stack POS System 🛒

A modern Point of Sale (POS) application built with **Next.js** (Frontend) and **NestJS** (Backend). This system features product management, a cart system with promo codes, order status tracking, and sales reporting.

## 🛠 Tech Stack

- **Frontend:** Next.js, Material UI (MUI), SWR, Zustand
- **Backend:** NestJS, TypeORM
- **Database:** PostgreSQL (Supabase)

---

## 📋 Prerequisites

Before running the system, ensure you have the following installed:
1.  **Node.js** (v18 or later)
2.  **Internet Connection** (Required to connect to the cloud database)

---

## 🚀 Quick Start Guide

### 1. Backend Setup (NestJS)
**Port:** `3000`

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a new file named `.env` in the `backend` root directory and paste the following:

    ```env
    PORT=3000

    # Cloud Database (Supabase)
    DATABASE_URL="postgresql://postgres.jpcvfbjnksanrlkllupy:SunLand2548@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"
    ```

4.  Start the backend server:
    ```bash
    npm run start:dev
    ```
    ## API: `http://localhost:3000`
    ## Swagger Docs: `http://localhost:3000/api`

---

### 2. Frontend Setup (Next.js)
**Port:** `3001`

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the frontend application on port **3001**:
    ```bash
    npm run dev -- -p 3001
    ```

4.  Open your browser:
    👉 **http://localhost:3001**

---

## 📱 Features & Navigation

| Page | Route | Description |
| :--- | :--- | :--- |
| **POS Terminal** | `/` | Main dashboard. Select products, manage cart, apply promo codes, and checkout. |
| **Kitchen/Orders**| `/orders` | Real-time order list. Staff can advance status (Open → Confirmed → Ready → Completed). |
| **Reports** | `/reports` | Sales analytics. Filter by date to view total revenue, order counts, and tax collected. |

---

## 📦 Database Seeding (First Run)

If your database is empty, you can generate sample discount codes to test the promo feature:

1.  Ensure the backend is running.
2.  Visit the API docs: **http://localhost:3000/api**
3.  Scroll to the **Discounts** section.
4.  Execute the `POST /discounts/seed` endpoint.
5.  **Test Code:** You can now use the promo code `WELCOME50` (50 THB off) or `SUMMER10` (10% off) in the frontend.

# 💡 Design Decisions & Architecture

I prioritize 

**1.Financial Accuracy**

**2.Maintainability** 

**3.Production Readiness**

Below are the key architectural decisions and the reasoning behind them.

### 1. Tech Stack Decisions

* **Database: PostgreSQL (Supabase)**
    * **Decision:** Use an ACID-compliant relational database.
    * **Reason:** Financial integrity demands atomic transactions. Complex writes (Order + Items + Discounts) must succeed or fail as a single atomic unit to prevent data corruption.
    * **Supabase Reason** At first, I would like to use Docker with redis cahce, but under time constraint, Supabase is better

* **Backend: NestJS + TypeORM**
    * **Decision:** Structured, modular framework with an ORM.
    * **Reason:** NestJS modules enforce separation of concerns ("Modular Monolith"), allowing for easier testing and future microservice extraction. TypeORM accelerates development through clear entity mapping and relationship management.

* **Frontend: Next.js + MUI**
    * **Decision:** Server-side rendering framework with a robust component library.
    * **Reason:** Next.js provides a robust routing structure, and MUI ensures a consistent, accessible UI without custom CSS overhead.

---

### 2. Non-Functional Requirements (NFRs)

#### A. Accuracy & Financial Integrity
* **Integer-Based Storage:**
    * **Decision:** Store all monetary values in minor units (Satang/Cents).
    * **Reason:** Eliminates floating-point errors (e.g., `0.1 + 0.2 !== 0.3`). Zero tolerance for rounding errors in financial calculations.
* **Backend Authority:**
    * **Decision:** Backend performs all tax/discount calculations; Frontend is display-only.
    * **Reason:** Security. Prevents malicious client-side manipulation via browser tools ensuring the invoice matches the server state.

#### B. Consistency & Lifecycle
* **Atomic Transactions:**
    * **Decision:** Wrap order creation in database transactions.
    * **Reason:** Prevents "Ghost Orders" (e.g., money deducted but items not recorded) by ensuring all-or-nothing writes.
* **Strict State Machine:**
    * **Decision:** Enforce linear flow: `OPEN` → `CONFIRMED` → `PREPARING` → `READY` → `COMPLETED`.
    * **Reason:** Prevents invalid operational states (e.g., completing an un-prepared order), ensuring the database state always reflects physical reality.

#### C. Auditability
* **Snapshot Pattern:**
    * **Decision:** `OrderItems` store a *copy* of the product price and name at the moment of purchase.
    * **Reason:** Historical records must remain immutable. Even if the master catalog price changes later, the receipt data remains historically accurate.

#### D. Observability & Root Cause Analysis
* **Global Exception Filters:**
    * **Decision:** Centralized error handling maps domain errors to specific HTTP 4xx responses.
    * **Reason:** rapid debugging. Developers see specific errors (e.g., "Promo Code Expired") rather than generic "Internal Server Error."
* **Strict Input Validation (DTOs):**
    * **Decision:** Use `class-validator` at API boundaries.
    * **Reason:** Fail-fast strategy. Corrupt data (e.g., negative quantities) is rejected immediately before reaching business logic, keeping the service layer clean.

#### E. Maintainability & Extensibility
* **Modular Monolith Architecture:**
    * **Decision:** Structure the application with strict internal boundaries (Modules for Products, Orders, Discounts, Reports).
    * **Reason:** Balances speed of delivery (shipping in 3 days) with long-term flexibility. Because the domains are decoupled, individual modules can be easily extracted into microservices when scaling is actually required.

#### F. Performance
* **Optimized Data Access:**
    * **Decision:** Prioritize database indexing on high-traffic columns (e.g., `orders.createdAt`, `orders.status`).
    * **Reason:** Ensures that transactional queries remain fast and responsive even as the dataset grows, preventing slow page loads on the Kitchen Display System during peak hours.
 

# 🎯 What I Prioritized Most (and Why)

**1. Observability & Debuggability (Logs, Swagger, Validation)**
* **Why:** In this scenario, where I work in a collaborative team environment, clear documentation and visibility are crucial. I prioritized Swagger documentation and structured logging to ensure that any team member (or future developer) can easily understand the API contracts and debug issues without digging through the source code.

**2. Data Integrity & Financial Accuracy**
* **Why:** This is the heart of a POS system. I prioritized strict validation and integer-based math to ensure that every transaction is recorded correctly. In a financial application, "mostly correct" is not acceptable—it must be 100% accurate.

---

# 🚀 Future Improvements

If this system were to be developed further for production, these are the next steps:

**1. Authentication & Role-Based Access Control (RBAC)**
* **Improvement:** Implement JWT Authentication with distinct roles (`ADMIN`, `CASHIER`, `KITCHEN`) and security auditing.
* **Reason:** Currently, the system is open. We need to protect sensitive sales data (Reports) from standard staff and prevent unauthorized refunds or cancellations.

**2. Payment Gateway Integration & Receipt Generation**
* **Improvement:** Integrate Thai QR Payment (PromptPay) or mobile banking APIs for actual payment processing.
* **Reason:** Currently, orders are "recorded" but not financially settled. For a real restaurant, the system needs to verify that money has actually been received before closing an order.

**3. DevOps & Automated Deployment (CI/CD)**
* **Improvement:** Containerize the application using **Docker** and set up a **CI/CD pipeline** (e.g., GitHub Actions) for automated testing and deployment.
* **Reason:** Currently, deployment is manual. Automating this ensures that every code change is tested before reaching production, reducing the risk of downtime or bugs in a live restaurant environment.
