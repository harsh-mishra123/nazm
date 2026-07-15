# nazm® 

**nazm** is a modern, social poetry platform built to celebrate the written and spoken word. It provides a sanctuary for publishing poems, sharing recitations, and connecting with a community of poetry lovers.

## 🌟 Features

### Content & Curation
- **Rich Poetry Reading**: Immersive poem pages with beautiful typography (Instrument Serif).
- **Recitation Videos**: Support for uploading and attaching video/audio recitations directly to poems.
- **Categorization**: Browse poems by curated categories and individual poets.
- **Social Interaction Overlay**: Like, Save, Share, and Comment on poems directly inside card overlays without leaving the page.

### Social & Real-Time Chat
- **User Profiles**: Custom profiles with unique claimed usernames and avatars.
- **Automatic Profile Guard**: New users are automatically redirected to pick a username immediately after registration, ensuring every reader is identifiable in chat.
- **Real-Time 1:1 Chat**: Live messaging system built on SSE and RabbitMQ.
- **Direct Reader Messaging**: Click the "Chat" button next to any reader's comment to instantly start a direct real-time chat with them.
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
The Postgres database is the source of truth, utilizing relational integrity:
- **`User`**: Synced securely from Clerk.
- **`Poem` & `Poet` & `Category`**: Core content models.
- **`Like` & `Save` & `Comment`**: User interaction models linked via Foreign Keys to `User` and `Poem`.
- **`Comment self-relation`**: Self-referencing relationship fields (`parentId` and `replies`) inside the `Comment` model to support threaded replies.
- **`Conversation` & `Message`**: Chat models. Messages use an enum `type` (`TEXT` or `POEM_SHARE`) to handle rich embeds.

### 2. Real-Time Chat Infrastructure
The chat system is built for resilience and scalability, decoupling persistence from delivery:
- **Write Path (Postgres)**: Every message is first written to the database to guarantee history and prevent data loss.
- **Delivery Path (RabbitMQ)**: After DB insertion, the message is published to a durable Direct Exchange.
- **Consumption (SSE)**: Clients connect to an endpoint (`/api/chat/stream`) which establishes a Server-Sent Events (SSE) connection. The server spins up a RabbitMQ consumer bound to a per-user durable queue (7-day TTL). Messages are piped directly from RabbitMQ to the SSE stream.
- **Reliability**: Uses manual ACKs in RabbitMQ. If a user disconnects, un-acked messages remain in their queue for when they reconnect.

### 3. Authentication & Data Sync
- **Clerk Middleware**: Edge-compatible routing protection (`proxy.ts`) to secure `/chat`, `/admin`, and `/saved` routes.
- **Username Guard**: The main `(browse)` layout runs a server-side authentication check. If a logged-in user does not have a claimed username in the database, they are blocked and redirected to `/complete-profile` before accessing the feed.
- **Webhook Syncing**: Uses Clerk webhooks (verified via `svix`) to sync `user.created`, `user.updated`, and `user.deleted` events.

### 4. Interactive Frontend Patterns & Modal Overlays
- **Social Modal Overlay**: When a user clicks a poem, it pops up in a rich modal overlay containing live interactive elements. The modal uses a custom client hook to lazy-fetch comments and user interaction state (likes/saves) dynamically without hurting page load speed.
- **Robust Local Interactive States**: Likes, saves, and comments use state-backed updates instead of App Router transition-resets. This prevents optimistic UI states from jumping back on completion, and handles error rollbacks gracefully.
- **Threaded Replies**: Renders recursive replies 1-level deep inside comment blocks with collapsible/expandable forms.
- **Direct Chat Routing**: Features a direct link next to reader comments that routes to `/chat/new?userId=<id>` to seamlessly trigger direct messages.

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
