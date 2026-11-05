# Threadbase - Live Chat with Socket.io (Starter)

Add a real-time chat feature to Threadbase using Socket.io: wrap the HTTP server,
authenticate sockets with JWT, use a room to scope the thread's messages, and wire a
React `useSocket` hook. Two windows on the same thread should see each other's messages
instantly.

## Setup

```bash
# Terminal 1 - the Express + Socket.io server
cd server && cp .env.example .env && npm install && npm start

# Terminal 2 - the React app
cd client && cp .env.development.example .env.development && npm install && npm run dev
```

`socket.io` and `socket.io-client` are **not** installed yet - installing them is Task 1.

## What you will do

1. `npm install socket.io` (server) and `npm install socket.io-client` (client).
2. In `server/server.js`: wrap the app with `createServer`, attach Socket.io with CORS,
   add `io.use` JWT auth, add `room:join` and `chat:message` handlers, and switch
   `app.listen` to `httpServer.listen`.
3. In `client/src/hooks/useSocket.js`: create the socket with `auth: { token }`, join the
   room, listen for `chat:message`, and clean up with `socket.off()` + `socket.disconnect()`.

`client/src/components/ChatRoom.jsx` is already wired to `useSocket` - once the hook works,
the UI works.

## Testing your work

- Open the app, log in as **Ada**. Open a second browser window (or incognito), log in as **Linus**.
- Type in one window and press Send. The message should appear in **both** windows in well under a second.
- Log in credentials: `ada@threadbase.dev` / `password` and `linus@threadbase.dev` / `password`.

## What is already done

- The Express server with `/auth/login` (issues a JWT) and an HTTP `verifyToken` route.
- The React app: login page, auth context (holds the `token`), and `ChatRoom.jsx`.
