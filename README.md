# Ceresea – Luxury Lipcare E-Commerce Website

Ceresea is a full-stack e-commerce website developed for a luxury lipcare brand. The application provides a complete shopping experience, from product discovery and Google authentication to online payments, order tracking, cancellation, and refunds.

The project was built using the **MERN stack** and deployed to production using **Netlify**, with the Express backend running through **Netlify Functions**.

## Live Website

https://ceresea-luxe.netlify.app

---

## About the Project

Ceresea is an e-commerce platform designed around a premium single-product lipcare brand with multiple shade and flavour variations.

The goal was to build a clean, responsive and production-ready shopping experience while also implementing the backend systems required for authentication, payments, order management and administration.

The application supports the complete customer journey:

**Browse Product → Select Shade → Add to Cart → Login → Checkout → Pay → Track Order → Cancel / Refund**

---

## Features

### Customer Experience

- Responsive landing page
- Premium brand-focused UI
- Product showcase with six shade variations
- Interactive shade selector
- Product quantity selection
- Add to Cart functionality
- Persistent cart using Local Storage
- Mobile-friendly shopping experience
- Checkout form with customer and shipping details
- Saved addresses for logged-in users
- Order confirmation page
- Order history
- Individual order details
- Order status tracking
- Order cancellation
- Refund status tracking

### Authentication

- Google Sign-In
- JWT-based authentication
- Protected user routes
- Persistent login session
- User-specific orders and saved addresses

### Payments

Integrated **Razorpay** for secure online payments.

The payment system includes:

- Razorpay order creation from the backend
- Server-side payment amount calculation
- Payment signature verification using HMAC SHA-256
- Razorpay payment verification
- Payment status validation
- Webhook signature verification
- `payment.captured` webhook handling
- `payment.failed` webhook handling
- Payment reconciliation for interrupted checkout flows
- Duplicate payment protection
- Live payment support
- Razorpay refund integration

The complete payment and refund flow was tested successfully in production.

### Order Management

Orders are stored in MongoDB with:

- Customer information
- Shipping address
- Ordered items
- Selected product shade
- Quantity
- Order amount
- Payment status
- Order status
- Razorpay order/payment information
- Refund status

Supported order states include:

`Pending → Confirmed → Processing → Shipped → Delivered`

Orders can also transition to:

`Cancelled`

### Cancellation & Refunds

Paid orders can be cancelled while eligible for cancellation.

For paid orders, the backend communicates with Razorpay to initiate the refund and synchronizes the resulting payment, refund and order statuses.

The production refund flow was successfully tested with a real Razorpay transaction.

### Admin Dashboard

The project includes a protected administration system for managing store operations.

Admin functionality includes:

- Secure admin access
- Dashboard statistics
- Recent orders
- View all customer orders
- View customer information
- View shipping addresses
- View ordered products
- Update order status
- Order management
- Synchronization of status changes with the customer's order history

### Email Notifications

Transactional email functionality is integrated using **Resend**.

Emails are used for important order/payment events such as:

- Successful order/payment confirmation
- Payment failure notifications
- Administrative order notifications

---

## Product Variations

Ceresea is available in six variations:

| Shade | Variation |
|---|---|
| 🔴 Red | Strawberry |
| 🟡 Yellow | Lemon |
| 🔵 Blue | Blue Berry |
| 🩷 Pink | Rose Blush |
| 🟢 Green | Green Apple |
| 🟣 Purple | Purple |

**Price:** ₹120  
**Net Quantity:** 2.5 gm

Key ingredients include:

- Beeswax / Honey
- Shea Butter
- Coconut Oil

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Framer Motion
- Local Storage

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Google OAuth

### Payments

- Razorpay
- Razorpay Webhooks
- HMAC SHA-256 payment verification

### Email

- Resend

### Deployment

- Netlify
- Netlify Functions
- MongoDB Atlas
- GitHub

---

## Architecture

```text
                 ┌──────────────────────┐
                 │      React + Vite    │
                 │       Frontend       │
                 └──────────┬───────────┘
                            │
                         /api/*
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Netlify Function   │
                 │ serverless-http      │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Express REST API   │
                 └───────┬──────┬───────┘
                         │      │
                  ┌──────▼──┐ ┌─▼─────────┐
                  │ MongoDB │ │ Razorpay  │
                  │  Atlas  │ │ Payments  │
                  └─────────┘ └───────────┘
```

The React frontend and Express backend are deployed together on Netlify.

API requests made to:

```text
/api/*
```

are redirected to the Express application through a Netlify Function.

This allows the existing Express backend to operate in a serverless production environment.

---

## Project Structure

```text
ceresea/
│
├── client/
│   ├── src/
│   └── ...
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── orders.js
│   │   └── payments.js
│   ├── services/
│   ├── app.js
│   └── server.js
│
├── netlify/
│   └── functions/
│       └── api.js
│
├── netlify.toml
├── package.json
└── README.md
```

---

## Payment Flow

```text
Customer Checkout
       ↓
Create Ceresea Order
       ↓
Backend Creates Razorpay Order
       ↓
Razorpay Checkout
       ↓
Customer Completes Payment
       ↓
Backend Verifies Signature
       ↓
Razorpay Payment Validation
       ↓
Order Marked as Paid & Confirmed
       ↓
Confirmation / Order History
```

The application also uses Razorpay webhooks as an additional server-side mechanism for synchronizing payment events.

---

## Payment Recovery

The checkout flow includes payment recovery for situations where the payment succeeds but the browser is closed, redirected or interrupted before the frontend receives the final confirmation.

The application can reconcile the pending Ceresea order with Razorpay and restore the correct payment/order state.

---

## Security

The application follows several backend security practices:

- Payment amounts are calculated and validated server-side
- Razorpay signatures are verified on the server
- Razorpay webhook signatures are verified
- Payment amount and currency are validated before confirming orders
- Protected API routes use authentication middleware
- User-specific orders are validated against the authenticated user
- Sensitive credentials are stored using environment variables
- Production secrets are not exposed to the frontend or committed to the repository

---

## Environment Variables

Create the required environment files locally.

Example variables used by the application include:

```env
MONGO_URI=
JWT_SECRET=

GOOGLE_CLIENT_ID=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

RESEND_API_KEY=
EMAIL_FROM=
ADMIN_EMAIL=

CLIENT_URL=
```

Frontend environment variables include:

```env
VITE_GOOGLE_CLIENT_ID=
VITE_CONTACT_EMAIL=
VITE_INSTAGRAM_URL=
```

> Never commit real API keys, database credentials or production secrets to GitHub.

---

## Running Locally

Clone the repository:

```bash
git clone <your-repository-url>
cd ceresea
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

Configure the required environment variables.

Start the backend:

```bash
npm run dev
```

In another terminal, start the frontend:

```bash
cd client
npm run dev
```

---

## Deployment

The application is deployed using Netlify.

The production setup uses:

```text
React/Vite
    ↓
Netlify
    ↓
Netlify Functions
    ↓
Express
    ↓
MongoDB Atlas / Razorpay / Resend
```

`netlify.toml` handles the frontend build configuration, serverless function directory, API redirects and React SPA routing.

---

## Legal & Customer Pages

The website also includes dedicated customer/legal pages:

- Terms & Conditions
- Privacy Policy
- Refund / Cancellation Policy

---

## Production Testing

The major commerce flows were tested end-to-end, including:

- Authentication
- Cart and checkout
- Order creation
- Live Razorpay payment
- Payment verification
- Payment webhooks
- Order confirmation
- Order history
- Order cancellation
- Live Razorpay refund
- Refund status synchronization

---

## What I Learned

Building Ceresea involved working beyond a basic CRUD application and implementing a complete production e-commerce workflow.

Some of the key areas covered while developing the project were:

- Designing a responsive e-commerce experience
- Building REST APIs with Express
- Managing authentication and protected routes
- Designing MongoDB order data
- Integrating a production payment gateway
- Secure server-side payment verification
- Working with payment webhooks
- Handling payment recovery and reconciliation
- Implementing cancellation and refund workflows
- Building an admin order-management system
- Sending transactional emails
- Deploying an Express application using serverless functions
- Managing production environment variables and secrets

---

## Developer

Developed by **B Somesh Raju**

Full-Stack MERN Developer

---

## Disclaimer

This repository is maintained as a portfolio and proof-of-work representation of the development carried out for the Ceresea e-commerce project.

Brand assets, product imagery, logos and other proprietary Ceresea materials belong to their respective owner.