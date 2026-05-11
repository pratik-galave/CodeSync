# CodeSync — Real-Time Collaborative Code Editor

A web-based collaborative code editor that enables multiple users to edit the same document simultaneously with live synchronization. Built with **Yjs** for conflict-free replicated data types (CRDT), **Socket.io** for real-time WebSocket communication, and **Monaco Editor** for a powerful editing experience.

## Features

- 👥 **Real-time Collaboration** — Multiple users can edit the same code file simultaneously
- 🔄 **Instant Synchronization** — Changes propagate across all connected clients instantly
- 💻 **Monaco Editor** — Professional code editor from VS Code with syntax highlighting & IntelliSense
- 🌐 **WebSocket-based** — Efficient bidirectional communication for low-latency updates
- 👁️ **Awareness** — See connected users' presence and cursors in real-time
- 🔗 **Easy Sharing** — Join sessions with shareable URLs

## Tech Stack

- **Frontend**: React 18, Vite, Monaco Editor, Yjs, Y-Socket.io
- **Backend**: Node.js, Express, Socket.io, Y-Socket.io
- **Real-time Sync**: Yjs CRDT, Socket.io WebSocket

## Project Structure

```
AWSDOCKER/
├── backend/              # Node.js + Express server
│   ├── server.js        # Main server file with Socket.io setup
│   ├── package.json     # Backend dependencies
│   └── public/          # Static files
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── main.jsx    # Entry point
│   │   └── app/
│   │       └── App.jsx # Main React component
│   ├── package.json    # Frontend dependencies
│   └── vite.config.js  # Vite configuration
└── dockerfile          # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git (optional, for cloning)

### Installation

1. **Clone or navigate to the project directory**

```bash
cd AWSDOCKER
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

### Running the Project

#### Start the Backend Server

```bash
cd backend
npm start
```

The server will run on `http://localhost:3001`

#### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will typically run on `http://localhost:5173`

### Accessing the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Optionally, add a username via URL parameter: `http://localhost:5173?username=YourName`
3. Open the same URL in another browser window/tab to test real-time collaboration
4. Start editing and see changes sync instantly!

## Usage

- **Edit Code**: Use the Monaco Editor to write and edit code in real-time
- **Collaborate**: Invite others to the same session by sharing the URL
- **See Changes**: All edits are synchronized instantly across all connected clients
- **Multiple Users**: See who's connected and their cursor positions

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### WebSocket Connection

The frontend connects to the backend via WebSocket at `ws://localhost:3001/socket.io/`

## Development

### Adding Dependencies

**Backend:**
```bash
cd backend
npm install <package-name>
```

**Frontend:**
```bash
cd frontend
npm install <package-name>
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This generates optimized files in the `dist/` directory.

## Troubleshooting

### Connection Failed Error
- Ensure the backend server is running on port 3001
- Check firewall settings
- Verify both services are on `localhost`

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### WebSocket Errors
- Ensure `socket.io` is installed in backend
- Check browser console for detailed error messages
- Verify `CORS` settings in `server.js`

## Contributing

Feel free to fork, modify, and improve the project!

## License

ISC

## Contact & Support

For issues or questions, please open an issue in the repository.

---

**Happy Coding!** 🚀
