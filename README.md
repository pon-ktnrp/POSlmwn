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
    - API: `http://localhost:3000`
    - Swagger Docs: `http://localhost:3000/api`

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
