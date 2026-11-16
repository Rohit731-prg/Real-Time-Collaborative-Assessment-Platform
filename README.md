# Real-Time Collaborative Assessment Platform

A web application for creating and taking assessments in shared online rooms. It combines real-time collaboration and discussion with AI-assisted assessment support.

## Live application

[Open the deployed application](https://real-time-collaborative-assessment-fh83.onrender.com/)

## What it does

- Create courses, assessment rooms, and exams.
- Invite students to work together in a room.
- Exchange messages in real time.
- Manage student accounts and assessment answers.
- Use AI-powered chat and question-generation features.

## How it is built

The project has two applications:

| Application | Technology | Purpose |
| --- | --- | --- |
| `Client/` | React, TypeScript | Web interface and real-time client |
| `Server/` | Node.js, Express, Socket.IO | REST API, authentication, and real-time events |
| Database | MongoDB with Mongoose | Stores users, courses, rooms, exams, and messages |

The client uses Socket.IO to connect to the server. AI features also integrate with Google Generative AI, Pinecone, and Cohere.

## Prerequisites

- [Bun](https://bun.sh/) or Node.js with npm
- A MongoDB database
- API credentials for the AI integrations you intend to use

## Run locally

1. **Configure the server.** Create `Server/.env`:

   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=replace_with_a_long_random_secret
   GOOGLE_API_KEY=your_google_generative_ai_key
   PINECONE_API_KEY=your_pinecone_api_key
   CO_API_KEY=your_cohere_api_key
   ```

   Keep real credentials out of source control. AI credentials are needed when using the corresponding AI features.

2. **Configure the client.** Create `Client/.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Install dependencies** from each application directory:

   ```powershell
   cd Server
   bun install
   cd ..\Client
   bun install
   ```

   With npm, run `npm install` in each directory instead.

4. **Start the server** in `Server/`:

   ```powershell
   bun run dev
   ```

5. **Start the client** in another terminal, from `Client/`:

   ```powershell
   bun run dev
   ```

   Open the local URL printed by Vite (typically `http://localhost:5173`).

## Useful commands

Run these from the relevant application directory:

| Command | Application | Description |
| --- | --- | --- |
| `bun run dev` | Client | Start the Vite development server |
| `bun run build` | Client | Type-check and create a production build |
| `bun run lint` | Client | Run Oxlint |
| `bun run dev` | Server | Start the API server with Nodemon |

## API areas

The server exposes these API route prefixes:

- `/api/student` — student accounts and authentication
- `/api/course` — courses
- `/api/room` — collaborative rooms
- `/api/message` — room messages
- `/api/exam` — exams and assessment answers
- `/api/ai` — AI chat and assessment assistance

## Project layout

```text
Client/
  src/Components/   Pages and interface components
  src/Utils/        API and Socket.IO clients
  src/store/        Client state stores
Server/
  src/Controllers/  Request handlers
  src/Models/       MongoDB schemas
  src/Routers/      REST API routes
  src/Socket/       Real-time event handling
  src/Utils/        AI, document, and assessment utilities
```

## Notes

- The API defaults to port `5000`; the client development server defaults to `5173`.
- `CLIENT_URL` must match the browser origin so credentialed API and Socket.IO requests can connect.
- The server uses cookie-based JWT authentication for protected API and socket connections.
- The server package currently does not define an automated test suite.
