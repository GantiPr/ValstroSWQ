import { io } from 'socket.io-client';
import readline from 'readline';

// Configuration - Update this with the actual Socket.io server URL
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';

class StarWarsSearchClient {
  constructor(url) {
    this.socket = null;
    this.url = url;
    this.isSearching = false;
    this.resultCount = 0;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to ${this.url}...`);
      
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✓ Connected to Star Wars API server\n');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('✗ Connection error:', error.message);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('\n✗ Disconnected:', reason);
      });

      this.socket.on('error', (error) => {
        console.error('✗ Socket error:', error);
      });

      // Listen for search results
      this.socket.on('search', (data) => {
        this.handleSearchResult(data);
      });
    });
  }

  search(query) {
    if (!this.socket || !this.socket.connected) {
      console.error('✗ Not connected to server');
      return;
    }

    if (!query || query.trim() === '') {
      console.error('✗ Please provide a search query');
      return;
    }

    console.log(`\nSearching for: "${query}"`);
    console.log('─'.repeat(50));
    
    this.isSearching = true;
    this.resultCount = 0;
    this.socket.emit('search', { query: query.trim() });
  }

  handleSearchResult(data) {
    if (data && data.name) {
      this.resultCount++;
      const counter = data.resultCount ? `${this.resultCount}/${data.resultCount}` : this.resultCount;
      const films = data.films && data.films.length > 0 ? `[${data.films.join(', ')}]` : '[]';
      console.log(`${counter}: ${data.name} ${films}`);
    }
    
    // Check if this is the last result (resultCount matches the data)
    if (data && data.resultCount !== undefined) {
      if (this.resultCount >= data.resultCount) {
        this.handleSearchComplete();
      }
    }
  }

  handleSearchComplete() {
    console.log('\n' + '─'.repeat(50));
    if (this.resultCount == 1) {
        console.log(`Search complete - ${this.resultCount} result found\n`);
    }
    else {
        console.log(`Search complete - ${this.resultCount} results found\n`);
    }
    this.isSearching = false;
    this.resultCount = 0;
  }

  handleSearchError(error) {
    console.error('\n✗ Search error:', error.message || error);
    console.log('─'.repeat(50) + '\n');
    this.isSearching = false;
    this.resultCount = 0;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Main application
async function main() {
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║   Star Wars Character Search Console App    ║');
  console.log('╚═════════════════════════════════════════════╝\n');

  const client = new StarWarsSearchClient(SOCKET_URL);

  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to server. Exiting...');
    process.exit(1);
  }

  // Setup readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Search> '
  });

  console.log('Commands:');
  console.log('  - Type a character name to search');
  console.log('  - Type "exit" or "quit" to close the application');
  console.log('  - Press Ctrl+C to exit\n');

  rl.prompt();

  rl.on('line', (input) => {
    const command = input.trim().toLowerCase();

    if (command === 'exit' || command === 'quit') {
      console.log('\nGoodbye! May the Force be with you.\n');
      client.disconnect();
      rl.close();
      process.exit(0);
    } else if (command === '') {
      rl.prompt();
    } else {
      client.search(input.trim());
      // Wait a bit before showing prompt again to let results stream in
      setTimeout(() => {
        if (!client.isSearching) {
          rl.prompt();
        }
      }, 500);
    }
  });

  rl.on('close', () => {
    console.log('\nGoodbye! May the Force be with you.\n');
    client.disconnect();
    process.exit(0);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT. Closing...');
    client.disconnect();
    rl.close();
    process.exit(0);
  });
}

// Run the application
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
