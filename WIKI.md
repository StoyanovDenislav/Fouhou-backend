# 📚 Fouhou Backend Wiki

A comprehensive technical documentation for the Fouhou Backend API system.

## 📖 Table of Contents

1. [System Overview](#-system-overview)
2. [Architecture](#-architecture)
3. [Database Layer](#-database-layer)
4. [API Endpoints](#-api-endpoints)
5. [Batch Processing System](#-batch-processing-system)
6. [Configuration](#-configuration)
7. [Deployment](#-deployment)
8. [Development Guide](#-development-guide)
9. [Troubleshooting](#-troubleshooting)

---

## 🏗️ System Overview

The Fouhou Backend is a high-performance **Game Scores API** designed for real-time leaderboards and score tracking. The system is optimized for handling high-volume score submissions while maintaining accurate rankings through an intelligent batch processing system.

### Key Features
- **Real-time Score Submission**: Immediate score recording with deferred ranking calculations
- **Intelligent Batch Processing**: Smart ranking updates that optimize performance under load
- **Comprehensive API**: Full CRUD operations for game scores and leaderboards
- **Production Ready**: HTTPS/HTTP support, graceful shutdown, and comprehensive error handling

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: OrientDB 3.x (Graph Database)
- **Dependencies**: CORS, dotenv, orientjs

---

## 🔧 Architecture

The system follows a modular architecture with clear separation of concerns:

```
Fouhou-backend/
├── 📄 app.js                    # Main application entry point
├── 📁 api/                      # API route handlers
│   └── scoreAPI.js              # Score management endpoints
├── 📁 Database/                 # Database utilities
│   └── databaseClass.js         # OrientDB connection class
├── 📄 package.json              # Dependencies and scripts
└── 📄 README.md                 # Basic documentation
```

### Core Components

#### 1. Application Entry Point (`app.js`)
- Express.js server setup with middleware configuration
- CORS support for cross-origin requests
- Request logging middleware
- Environment-based HTTP/HTTPS configuration
- Graceful shutdown handling
- Global error handling

#### 2. API Layer (`api/scoreAPI.js`)
- RESTful API endpoints for score management
- Input validation middleware
- Intelligent batch processing system
- Comprehensive error handling

#### 3. Database Layer (`Database/databaseClass.js`)
- OrientDB connection management
- Database abstraction layer
- Connection pooling and cleanup

---

## 🗄️ Database Layer

### Database Class (`Database/databaseClass.js`)

The database layer provides a clean abstraction for OrientDB operations:

```javascript
class Database {
  constructor(host, port, username, password)
  getConnection()           // Returns OrientDB server connection
  useDatabase(name, user, password)  // Connects to specific database
  closeConnection()         // Closes server connection
}
```

#### Key Features:
- **Token Authentication**: Uses `useToken: true` for secure connections
- **Connection Management**: Proper connection setup and cleanup
- **Error Handling**: Comprehensive error handling for database operations

#### Configuration:
The database connection is configured through environment variables:

```javascript
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 2424,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gamedb',
  dbUser: process.env.DB_USER || 'admin',
  dbPassword: process.env.DB_PASSWORD || 'admin'
};
```

#### Database Schema:
The system uses a `GameScores` table/collection with the following structure:
- `GameID`: String - Identifier for the game
- `UserID`: String - Unique user identifier
- `Username`: String - Display name for the user
- `Score`: Number - The user's score
- `Ranking`: Number - Current ranking (0 for unranked)

---

## 🚀 API Endpoints

### Core Score Management

#### Submit Score
```http
POST /api/scores
Content-Type: application/json

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
    "username": "PlayerOne",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "note": "Rankings will update via batch processing"
  }
}
```

**Features:**
- Immediate score insertion with ranking set to 0
- Automatic batch processing trigger
- Input validation middleware
- Proper error handling

#### Bulk Score Submission
```http
POST /api/scores/bulk
Content-Type: application/json

{
  "scores": [
    {
      "gameID": "fouhou-v1",
      "score": 1500,
      "userID": "user1",
      "username": "Player1"
    },
    {
      "gameID": "fouhou-v1", 
      "score": 1200,
      "userID": "user2",
      "username": "Player2"
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
  "results": [...]
}
```

### Leaderboard and Rankings

#### Get Leaderboard
```http
GET /api/scores/{gameID}?limit=50&offset=0
```

**Features:**
- Pagination support with limit and offset
- Returns raw database rankings (no real-time calculations)
- Indicates whether scores are ranked or unranked

#### Get Top Scores
```http
GET /api/scores/top/{gameID}?limit=10
```

**Features:**
- Quick access to top performers
- Configurable limit (default: 10)
- Optimized for display purposes

#### Get User Scores
```http
GET /api/scores/user/{userID}?gameID=fouhou-v1
```

**Features:**
- All scores for a specific user
- Optional game filtering
- Sorted by score (descending)

#### Get User Rank
```http
GET /api/scores/user/{userID}/rank/{gameID}
```

**Features:**
- Specific user ranking in a game
- Percentile calculation
- Real-time rank calculation if not batched

### Administrative Operations

#### Force Ranking Update
```http
POST /api/force-update-rankings/{gameID}
```

**Purpose:**
- Manual trigger for batch ranking calculations
- Useful for maintenance or immediate ranking updates
- Returns detailed statistics about the update process

#### Delete User Scores
```http
DELETE /api/scores/{gameID}/{userID}
```

**Features:**
- Removes all scores for a user in a specific game
- Triggers batch processing for ranking recalculation
- Returns count of deleted records

### System Status

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "BULK Score API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "database": "gamedb"
  },
  "batchProcessor": {
    "pendingBatches": 0,
    "processingGames": 0
  }
}
```

#### Database Test
```http
GET /api/test-db
```

**Purpose:**
- Verifies database connectivity
- Returns score counts for testing
- Useful for deployment verification

#### Batch Status
```http
GET /api/batch-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchProcessor": {
      "pendingBatches": [...],
      "processingGames": [...],
      "config": {...}
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## ⚡ Batch Processing System

The heart of the system's performance optimization is the `RankingBatchProcessor` class.

### How It Works

1. **Score Submission**: When scores are submitted, they're immediately inserted with `Ranking = 0`
2. **Batch Triggering**: The batch processor is notified of the submission
3. **Intelligent Batching**: Multiple submissions are batched together for efficient processing
4. **Bulk Ranking Update**: Rankings are calculated and updated in optimized batches

### Configuration

```javascript
{
  maxBatchSize: 10,         // Force update after 10 submissions
  batchTimeoutMs: 2000,     // Maximum wait time (2 seconds)
  cooldownMs: 500,          // Cooldown between batch processes
  highLoadThreshold: 50     // Switch to high-load mode
}
```

### Batch Processing Logic

#### Submission Tracking
```javascript
addScoreSubmission(gameID) {
  // Track submissions per game
  // Force update if batch size exceeds threshold
  // Schedule timeout-based updates
}
```

#### Bulk Ranking Algorithm
```javascript
async bulkRankingUpdate(db, gameID) {
  // 1. Fetch all scores sorted by score DESC
  // 2. Calculate rankings with tie handling
  // 3. Execute bulk updates in batches of 25
  // 4. Return statistics
}
```

#### Key Features:
- **Tie Handling**: Proper ranking for tied scores
- **Batch Optimization**: Updates in chunks of 25 for reliability
- **Error Recovery**: Continues processing if individual updates fail
- **Performance Monitoring**: Detailed timing and statistics

### Benefits

1. **Performance**: Reduces database load by batching ranking calculations
2. **Consistency**: Ensures accurate rankings across all scores
3. **Scalability**: Handles high-volume submissions efficiently
4. **Reliability**: Error recovery and cooldown mechanisms

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `9000` | No |
| `HOST` | Server hostname | `localhost` | No |
| `DB_HOST` | OrientDB host | `localhost` | No |
| `DB_PORT` | OrientDB port | `2424` | No |
| `DB_USERNAME` | OrientDB username | `root` | No |
| `DB_PASSWORD` | OrientDB password | `password` | **Yes** |
| `DB_NAME` | Database name | `gamedb` | No |
| `DB_USER` | Database user | `admin` | No |
| `SSL_KEY_PATH` | SSL private key path | `./certs/privkey.pem` | Production |
| `SSL_CERT_PATH` | SSL certificate path | `./certs/fullchain.pem` | Production |

### Example `.env` File

```env
# Server Configuration
NODE_ENV=development
PORT=9000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DB_NAME=gamedb
DB_USER=admin

# SSL Configuration (Production only)
SSL_KEY_PATH=./certs/privkey.pem
SSL_CERT_PATH=./certs/fullchain.pem
```

### Application Configuration

#### Development Mode
- Uses HTTP protocol
- Detailed error messages
- Console logging enabled
- Hot reloading with nodemon

#### Production Mode
- Uses HTTPS protocol with SSL certificates
- Sanitized error messages
- Performance optimizations
- Graceful shutdown handling

---

## 🚀 Deployment

### Development Deployment

```bash
# 1. Clone repository
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start development server
npm run dev
```

The development server runs on HTTP and includes:
- Automatic restarts with nodemon
- Detailed error logging
- CORS enabled for all origins

### Production Deployment

#### Prerequisites
- OrientDB server running and accessible
- SSL certificates (for HTTPS)
- Environment variables configured

#### Steps

1. **Prepare SSL Certificates:**
```bash
mkdir certs
cp /path/to/privkey.pem certs/
cp /path/to/fullchain.pem certs/
```

2. **Set Production Environment:**
```bash
export NODE_ENV=production
export DB_PASSWORD=your_secure_password
# ... other variables
```

3. **Start Production Server:**
```bash
npm start
```

#### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start app.js --name "fouhou-backend"

# Monitor
pm2 monitor
pm2 logs fouhou-backend
```

### Server Configuration

The application automatically configures based on `NODE_ENV`:

- **Development**: HTTP server on specified port
- **Production**: HTTPS server with SSL certificates

### Health Monitoring

Once deployed, verify the system:

```bash
# Health check
curl http://localhost:9000/api/health

# Database test
curl http://localhost:9000/api/test-db

# Batch status
curl http://localhost:9000/api/batch-status
```

---

## 👨‍💻 Development Guide

### Project Structure

```
Fouhou-backend/
├── 📄 app.js                    # Express server setup
├── 📁 api/
│   └── scoreAPI.js              # Score management routes
├── 📁 Database/
│   └── databaseClass.js         # OrientDB wrapper
├── 📄 package.json              # Dependencies
├── 📄 .env                      # Environment config
└── 📄 README.md                 # Basic docs
```

### Available Scripts

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=production nodemon app.js",
    "dev": "cross-env NODE_ENV=development nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Key Dependencies

- **express**: Web framework
- **orientjs**: OrientDB driver
- **cors**: Cross-origin support
- **dotenv**: Environment configuration
- **nodemon**: Development auto-restart

### Development Workflow

1. **Local Setup:**
   ```bash
   npm install
   cp .env.example .env
   # Configure your local OrientDB
   ```

2. **Development Server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:9000
   ```

3. **Testing API:**
   ```bash
   # Health check
   curl http://localhost:9000/api/health
   
   # Submit test score
   curl -X POST http://localhost:9000/api/scores \
     -H "Content-Type: application/json" \
     -d '{"gameID":"test","score":100,"userID":"dev","username":"Developer"}'
   ```

### Code Style and Patterns

#### Error Handling
```javascript
const handleError = (res, error, message = 'Internal server error') => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
```

#### Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

#### Database Queries
```javascript
const result = await db.query(query, { 
  params: { gameID, userID, score } 
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
**Symptoms:**
- "Database connection failed" error
- Unable to connect to OrientDB

**Solutions:**
1. Verify OrientDB is running:
   ```bash
   # Check OrientDB status
   ps aux | grep orient
   ```

2. Check database credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=2424
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

3. Test database connectivity:
   ```bash
   curl http://localhost:9000/api/test-db
   ```

#### SSL Certificate Errors
**Symptoms:**
- "Error loading SSL certificates"
- HTTPS server fails to start

**Solutions:**
1. Verify certificate paths:
   ```bash
   ls -la certs/
   # Should show privkey.pem and fullchain.pem
   ```

2. Check file permissions:
   ```bash
   chmod 600 certs/privkey.pem
   chmod 644 certs/fullchain.pem
   ```

3. Validate certificates:
   ```bash
   openssl x509 -in certs/fullchain.pem -text -noout
   ```

#### Port Already in Use
**Symptoms:**
- "EADDRINUSE" error
- Server fails to start

**Solutions:**
1. Change port in `.env`:
   ```env
   PORT=9001
   ```

2. Kill process using the port:
   ```bash
   lsof -ti:9000 | xargs kill
   ```

#### High Memory Usage
**Symptoms:**
- Server becomes unresponsive
- Memory leaks

**Solutions:**
1. Monitor batch processing:
   ```bash
   curl http://localhost:9000/api/batch-status
   ```

2. Reduce batch size:
   ```javascript
   // In scoreAPI.js
   maxBatchSize: 5,      // Reduce from 10
   batchTimeoutMs: 1000  // Reduce timeout
   ```

3. Restart server periodically in high-load environments

### Debug Mode

Enable detailed logging by setting:
```bash
export NODE_ENV=development
```

This provides:
- Detailed error messages
- Console logging for all operations
- Batch processing debug information

### Performance Monitoring

#### Monitor Batch Processing
```bash
# Check batch status
curl http://localhost:9000/api/batch-status

# Expected response
{
  "success": true,
  "data": {
    "batchProcessor": {
      "pendingBatches": [],
      "processingGames": [],
      "config": {
        "maxBatchSize": 10,
        "batchTimeoutMs": 2000,
        "cooldownMs": 500
      }
    }
  }
}
```

#### Monitor Database Performance
```bash
# Check database statistics
curl http://localhost:9000/api/test-db

# Expected response includes score counts
{
  "success": true,
  "totalScores": 1234,
  "fouhouScores": 567
}
```

### Logs and Monitoring

#### Application Logs
The server logs all important operations:
- Score submissions
- Batch processing activities
- Database operations
- Error conditions

#### PM2 Monitoring (Production)
```bash
# View logs
pm2 logs fouhou-backend

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart fouhou-backend
```

---

## 📝 License

This project is licensed under the **ISC License**.

## 👨‍💻 Author

**Denislav Stoyanov**
- GitHub: [@StoyanovDenislav](https://github.com/StoyanovDenislav)

---

*This wiki documents the current implementation as of the latest code analysis. All features and endpoints described are based on the actual codebase.*