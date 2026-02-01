# ValstroSWQ - Star Wars Character Search

A console application for searching Star Wars characters using a Socket.io wrapper for the SWAPI (Star Wars API).

## Features

- 🔍 Real-time character search with streaming results
- 🌐 Socket.io v4 client for asynchronous communication
- ⚡ Handles partial and case-insensitive matches
- 🛡️ Comprehensive error handling
- 📊 Displays character details with result counter (e.g., 1/3, 2/3, 3/3)
- 🎬 Shows film appearances for each character

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker (recent version)

## Setup

### 1. Start the Socket.io Backend Server

Pull and run the Docker container:
```bash
docker run -p 3000:3000 aaronbate/socketio-backend
```

The server will be available at `http://localhost:3000` but there is nothing on the page.

### 2. Install Application Dependencies

In a new terminal window:
```bash
npm install
```

## Usage

Start the application:
```bash
npm start
```

### Commands

- Type any character name to search (e.g., "dar", "luke", "leia")
- Type `exit` / `quit` to close the application or press `Ctrl+C` to exit

### Example Searches

```
Search> dar

Searching for: "dar"
──────────────────────────────────────────────────
1/3. Darth Vader [A New Hope, The Empire Strikes Back, Return of the Jedi, Revenge of the Sith]
2/3. Biggs Darklighter [A New Hope]
3/3. Darth Maul [The Phantom Menace]

──────────────────────────────────────────────────
✓ Search complete - 3 result(s) found

Search> luke

Searching for: "luke"
──────────────────────────────────────────────────
1/1. Luke Skywalker [A New Hope, The Empire Strikes Back, Return of the Jedi, Revenge of the Sith]

──────────────────────────────────────────────────
✓ Search complete - 1 result(s) found
```

## Socket.io Events

### Emitted Events
- `search` - Initiates a character search with `{ query: "search term" }`

### Listened Events
- `search` - Receives individual character results (streamed asynchronously)
  - Response format:
    ```json
    {
      "page": 1,
      "resultCount": 3,
      "name": "Character Name",
      "films": ["Film 1", "Film 2"]
    }
    ```

## Error Handling

The application handles:
- Connection failures with automatic reconnection attempts
- Socket errors and disconnections
- Invalid search queries
- Server-side errors during search

## Technical Details

- Built with Socket.io Client v4
- Uses ES modules (type: "module")
- Implements event-driven architecture for async streaming
- Graceful shutdown handling
