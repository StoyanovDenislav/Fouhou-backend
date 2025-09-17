# Fouhou Backend API 🎮

A high-performance game scores API backend built with Node.js, Express, and OrientDB. This server provides comprehensive game scoring functionality with optimized batch processing, real-time leaderboards, and robust ranking systems.

## 🌟 Features

- **RESTful API** for game score management
- **Batch processing system** for efficient ranking updates
- **Real-time leaderboards** with pagination
- **User ranking and statistics** tracking
- **HTTPS/HTTP support** with automatic SSL certificate handling
- **Graceful shutdown** and error handling
- **CORS enabled** for cross-origin requests
- **Request logging** and monitoring
- **Health checks** and database testing endpoints

## 🏗️ Architecture

```
fouhou-backend/
├── app.js                 # Main Express application
├── api/
│   └── scoreAPI.js        # Score management API routes
├── Database/
│   └── databaseClass.js   # OrientDB connection wrapper
├── package.json           # Dependencies and scripts
└── README.md             # This documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **OrientDB** server running (default port 2424)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
   cd Fouhou-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env file (optional - defaults provided)
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Start production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `PORT` | `9000` | Server port |
| `HOST` | `localhost` | Server hostname |
| `DB_HOST` | `localhost` | OrientDB host |
| `DB_PORT` | `2424` | OrientDB port |
| `DB_USERNAME` | `root` | OrientDB server username |
| `DB_PASSWORD` | `password` | OrientDB server password |
| `DB_NAME` | `gamedb` | Database name |
| `DB_USER` | `admin` | Database user |
| `SSL_KEY_PATH` | `./certs/privkey.pem` | SSL private key path |
| `SSL_CERT_PATH` | `./certs/fullchain.pem` | SSL certificate path |

### Database Schema

The API expects a `GameScores` table with the following structure:

```sql
CREATE CLASS GameScores
CREATE PROPERTY GameScores.GameID STRING
CREATE PROPERTY GameScores.UserID STRING  
CREATE PROPERTY GameScores.Username STRING
CREATE PROPERTY GameScores.Score INTEGER
CREATE PROPERTY GameScores.Ranking INTEGER
CREATE INDEX GameScores.GameID_UserID ON GameScores (GameID, UserID) UNIQUE
```

## 📡 API Endpoints

### Root & Health

#### `GET /`
Server information and status
```json
{
  "success": true,
  "message": "Game Scores API Server",
  "version": "1.0.0",
  "environment": "development",
  "protocol": "http",
  "host": "localhost:9000",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/health`
Health check with batch processor status
```json
{
  "success": true,
  "message": "BULK Score API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "database": "gamedb",
    "host": "localhost",
    "port": 2424
  },
  "batchProcessor": {
    "pendingBatches": 0,
    "processingGames": 0
  }
}
```

#### `GET /api/test-db`
Database connection test
```json
{
  "success": true,
  "message": "Database connection successful",
  "totalScores": 1250,
  "fouhouScores": 850,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Score Management

#### `POST /api/scores`
Submit a single game score

**Request Body:**
```json
{
  "gameID": "fouhou-v1",
  "score": 1500,
  "userID": "user123",
  "username": "PlayerOne"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "rid": "#12:34",
    "gameID": "fouhou-v1",
    "score": 1500,
    "userID": "user123",
    "username": "PlayerOne"
  }
}
```

#### `POST /api/scores/bulk`
Submit multiple scores in batch

**Request Body:**
```json
{
  "scores": [
    {
      "gameID": "fouhou-v1",
      "score": 1500,
      "userID": "user123",
      "username": "PlayerOne"
    },
    {
      "gameID": "fouhou-v1", 
      "score": 2000,
      "userID": "user456",
      "username": "PlayerTwo"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk submission completed: 2/2 successful",
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "results": [
    {
      "success": true,
      "data": {
        "rid": "#12:34",
        "gameID": "fouhou-v1",
        "score": 1500,
        "userID": "user123",
        "username": "PlayerOne"
      }
    }
  ]
}
```

### Leaderboards & Rankings

#### `GET /api/scores/:gameID`
Get paginated leaderboard for a game

**Query Parameters:**
- `limit` (default: 50) - Number of scores to return
- `offset` (default: 0) - Starting position

**Example:** `GET /api/scores/fouhou-v1?limit=10&offset=0`

**Response:**
```json
{
  "success": true,
  "data": {
    "gameID": "fouhou-v1",
    "scores": [
      {
        "ranking": 1,
        "score": 2500,
        "userID": "user789",
        "username": "TopPlayer",
        "isRanked": true
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 150,
      "hasMore": true
    }
  }
}
```

#### `GET /api/scores/top/:gameID`
Get top scores (limited set)

**Query Parameters:**
- `limit` (default: 10) - Number of top scores

**Example:** `GET /api/scores/top/fouhou-v1?limit=5`

#### `GET /api/scores/user/:userID`
Get all scores for a specific user

**Query Parameters:**
- `gameID` (optional) - Filter by specific game

**Example:** `GET /api/scores/user/user123?gameID=fouhou-v1`

#### `GET /api/scores/user/:userID/rank/:gameID`
Get user's rank and statistics in a specific game

**Response:**
```json
{
  "success": true,
  "data": {
    "userID": "user123",
    "username": "PlayerOne",
    "gameID": "fouhou-v1",
    "bestScore": 1500,
    "rank": 25,
    "totalPlayers": 150,
    "percentile": "83.33",
    "isRanked": true
  }
}
```

### Administrative

#### `POST /api/force-update-rankings/:gameID`
Manually trigger ranking update for a game

#### `DELETE /api/scores/:gameID/:userID`
Delete all scores for a user in a specific game

#### `GET /api/batch-status`
Get current batch processor status

**Response:**
```json
{
  "success": true,
  "data": {
    "batchProcessor": {
      "pendingBatches": 2,
      "processingGames": 1,
      "config": {
        "maxBatchSize": 10,
        "batchTimeoutMs": 2000,
        "cooldownMs": 500
      }
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔄 Batch Processing System

The API includes an intelligent batch processing system that optimizes ranking updates:

- **Automatic batching** - Groups score submissions for efficient processing
- **Configurable thresholds** - Adjustable batch sizes and timeouts
- **High-load optimization** - Switches to bulk mode under heavy traffic
- **Cooldown management** - Prevents excessive database load

### Batch Configuration

```javascript
const config = {
  maxBatchSize: 10,        // Maximum scores per batch
  batchTimeoutMs: 2000,    // Maximum wait time before processing
  cooldownMs: 500,         // Cooldown between batch processes
  highLoadThreshold: 50    // Threshold for high-load mode
};
```

## 🛠️ Development

### Available Scripts

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Test (placeholder)
npm test
```

### Database Connection

The `Database` class provides OrientDB integration:

```javascript
const Database = require('./Database/databaseClass');
const dbInstance = new Database(host, port, username, password);

// Get database connection
const db = dbInstance.useDatabase(dbName, user, password);

// Execute queries
const results = await db.query('SELECT * FROM GameScores');

// Close connection
dbInstance.closeConnection();
```

### Error Handling

The API includes comprehensive error handling:

- **Validation middleware** for request data
- **Global error handler** for unhandled exceptions  
- **Graceful shutdown** on system signals
- **Development vs production** error details

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   export NODE_ENV=production
   export PORT=9000
   export DB_HOST=your-orientdb-host
   export DB_PASSWORD=secure-password
   ```

2. **SSL Certificates**
   ```bash
   # Place certificates in /certs directory
   ./certs/privkey.pem
   ./certs/fullchain.pem
   ```

3. **Process Management**
   ```bash
   # Using PM2 (recommended)
   npm install -g pm2
   pm2 start app.js --name fouhou-backend
   pm2 startup
   pm2 save
   ```

### Docker Support

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 9000
CMD ["npm", "start"]
```

## 🔍 Monitoring & Logging

### Request Logging
All requests are automatically logged with:
- Timestamp
- HTTP method and path
- Origin header
- User-Agent

### Health Monitoring
- `/api/health` - Service health check
- `/api/test-db` - Database connectivity
- `/api/batch-status` - Batch processor status

## 🛡️ Security

- **CORS enabled** with configurable origins
- **HTTPS support** in production
- **Input validation** on all endpoints
- **Error sanitization** (no sensitive data in production errors)
- **Graceful degradation** on SSL certificate issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check OrientDB is running
curl http://localhost:2424

# Verify credentials in .env file
DB_HOST=localhost
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=your-password
```

#### SSL Certificate Issues
```bash
# Check certificate files exist
ls -la ./certs/
# Verify paths in .env
SSL_KEY_PATH=./certs/privkey.pem
SSL_CERT_PATH=./certs/fullchain.pem
```

#### Port Already in Use
```bash
# Find process using port 9000
lsof -i :9000
# Kill the process or change PORT in .env
export PORT=9001
```

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development DEBUG=* npm run dev
```

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API endpoint documentation

---

**Made with ❤️ for the gaming community**