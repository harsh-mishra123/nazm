# nazm® 

**nazm** is a modern, social poetry platform built to celebrate the written and spoken word. It provides a sanctuary for publishing poems, sharing recitations, and connecting with a community of poetry lovers.

## 🌟 Features

### Content & Curation
- **Rich Poetry Reading**: Immersive poem pages with beautiful typography (Instrument Serif).
- **Recitation Videos**: Support for uploading and attaching video/audio recitations directly to poems.
- **Categorization**: Browse poems by curated categories and individual poets.
- **Interactions**: Users can like, save, and comment on poems.

### Social & Real-Time Chat
- **User Profiles**: Custom profiles with unique claimed usernames and avatars.
- **Real-Time 1:1 Chat**: Live messaging system built on SSE and RabbitMQ.
- **Poem Sharing**: Share specific poems directly into chat conversations with attached notes.
- **Global Search**: Debounced prefix-matching search to find other users on the platform.

### Admin Dashboard
- **Content Management**: Secure admin panel to create, edit, and publish poems, poets, and categories.
- **Drafts & Publishing**: Support for draft poems before making them public.
- **Video Uploads**: Direct integration with AWS S3 for media uploads.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React Server Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom glassmorphism aesthetic.
- **Database**: [PostgreSQL](https://postgresql.org/) (hosted on [Neon](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Message Broker**: [RabbitMQ](https://www.rabbitmq.com/) (Real-time message delivery)
- **Object Storage**: [AWS S3](https://aws.amazon.com/s3/) (Media assets)

---

## 🏗 Architecture & Engineering

### 1. Database Schema
The Postgres database is the absolute source of truth, heavily utilizing relational integrity:
- **`User`**: Synced securely from Clerk.
- **`Poem` & `Poet` & `Category`**: Core content models.
- **`Like` & `Save` & `Comment`**: User interaction models linked via Foreign Keys to `User` and `Poem`.
- **`Conversation` & `Message`**: Chat models. Messages use an enum `type` (`TEXT` or `POEM_SHARE`) to handle rich embeds.

### 2. Real-Time Chat Infrastructure
The chat system is built for resilience and scalability, decoupling persistence from delivery:
- **Write Path (Postgres)**: Every message is first written to the database to guarantee history and prevent data loss.
- **Delivery Path (RabbitMQ)**: After DB insertion, the message is published to a durable Direct Exchange.
- **Consumption (SSE)**: Clients connect to an endpoint (`/api/chat/stream`) which establishes a Server-Sent Events (SSE) connection. The server spins up a RabbitMQ consumer bound to a per-user durable queue (7-day TTL). Messages are piped directly from RabbitMQ to the SSE stream.
- **Reliability**: Uses manual ACKs in RabbitMQ. If a user disconnects, un-acked messages remain in their queue for when they reconnect.

### 3. Authentication & Data Sync
- **Clerk Middleware**: Edge-compatible routing protection (`proxy.ts`) to secure `/chat`, `/admin`, and `/saved` routes.
- **Webhook Syncing**: Uses Clerk webhooks (verified via `svix`) to sync `user.created`, `user.updated`, and `user.deleted` events to the local Postgres database. This allows strictly typed Foreign Key constraints between application data (likes, messages) and users.
- **Concurrency Control**: Username claiming relies on database-level unique constraints (catching Prisma `P2002` errors) rather than check-then-insert application logic to prevent race conditions.

### 4. Frontend Patterns
- **Optimistic UI Updates**: Leveraging React 19's `useOptimistic` hook combined with `useTransition` for instantaneous feedback on Likes, Saves, and Chat message sending before the server responds.
- **Debouncing**: Custom debounced hooks for the username availability checker and global user search to minimize database load.
- **Responsive Overlays**: Complex modal states (like the Poem detail overlay in the browse view) handled natively without breaking route structures.

---

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- Docker (for local RabbitMQ)
- A Clerk Account
- An AWS Account (for S3)
- A Postgres Database (e.g., Neon)

### Environment Variables
Copy `.env.example` to `.env` and fill in the required keys:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Admin
ADMIN_EMAIL="your_email@example.com"

# AWS S3
AWS_REGION="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="..."

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start local RabbitMQ (using Docker):
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
