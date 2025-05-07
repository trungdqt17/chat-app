# Chat App Project

A demo real-time chat application featuring a Next.js frontend and a NestJS (Socket.IO) backend, containerized with Docker Compose. Optionally, a Microsoft SQL Server database can be enabled for persistent storage.

## Features
- Real-time messaging with Socket.IO
- Real-time data fetching and updates using TanStack Query integrated with Socket.IO
- Modern Next.js frontend
- Scalable NestJS backend
- Dockerized for easy setup
- Optional Microsoft SQL Server integration

## Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting Started (with Docker Compose)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <project-root>
   ```
2. **Start the services:**
   ```bash
   docker compose up --build
   ```
3. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:4000](http://localhost:4000)

### Enabling the Database (Optional)
- Uncomment the `db` service and `depends_on` in `docker-compose.yml`.
- The database will be available at `localhost:1433` (default SA password: `Your_password123`).

## Manual Development Setup

### Backend (NestJS)
```bash
cd socket-io-backend
npm install
npm run start:dev
```

### Frontend (Next.js)
```bash
cd chat-frontend
npm install
npm run dev
```
- The frontend expects the backend at `http://localhost:4000` (see `NEXT_PUBLIC_API_URL` in `docker-compose.yml`).

## Project Structure
```
├── chat-frontend/        # Next.js frontend
├── socket-io-backend/    # NestJS backend (Socket.IO)
├── docker-compose.yml    # Multi-service orchestration
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
MIT 

## Real-Time Data with TanStack Query & Socket.IO

This project features a modern approach to real-time data by integrating [TanStack Query](https://tanstack.com/query/latest) (react-query) with [Socket.IO](https://socket.io/):

- **Custom React hooks** (`useSocketQuery`) combine TanStack Query's caching and state management with Socket.IO's real-time events.
- Data is fetched and updated via Socket.IO events, not HTTP, enabling instant UI updates when new messages arrive.
- The chat demo in the frontend (`app/page.tsx`) showcases this pattern, using TanStack Query for both initial data and live updates.

**Example:**
```tsx
const { data: messages = [] } = useSocketQuery<string[], {}, string>({
  queryKey: ['chat'],
  fetchEvent: 'getMessages',
  updateEvent: 'newMessage',
  updateHandler: (newData, currentData = [], queryClient) => {
    queryClient.setQueryData<string[]>(['chat'], [...currentData, newData])
  }
})
```

This approach provides a robust, scalable, and type-safe way to handle real-time data in React apps. 