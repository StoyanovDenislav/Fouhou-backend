# 🎮 Fouhou Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![OrientDB](https://img.shields.io/badge/OrientDB-3.x-FF6B35?style=flat-square&logo=orientdb)](https://orientdb.org/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

A high-performance **Game Scores API** backend designed for real-time leaderboards and score tracking. Built with Node.js, Express, and OrientDB, featuring intelligent batch processing for optimal performance under high load.

## ✨ Features

### 🏆 Core Functionality
- **Real-time Score Submission** - Submit and track game scores instantly
- **Dynamic Leaderboards** - Fetch top scores and rankings for any game
- **User Score Tracking** - Individual player statistics and rank tracking
- **Batch Processing** - Smart ranking updates with configurable batching

### 🚀 Performance & Scalability
- **Intelligent Batching System** - Optimized ranking calculations under high load
- **CORS Support** - Cross-origin requests for web applications
- **Request Logging** - Comprehensive logging for monitoring and debugging
- **Health Monitoring** - Built-in health checks and status endpoints

### 🔒 Production Ready
- **HTTPS/HTTP Support** - Automatic SSL/TLS configuration for production
- **Environment Configuration** - Flexible environment-based settings
- **Graceful Shutdown** - Proper cleanup and shutdown handling
- **Error Handling** - Comprehensive error handling and validation

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express.js** | Web Framework | 4.18+ |
| **OrientDB** | Graph Database | 3.x |
| **CORS** | Cross-Origin Resource Sharing | 2.8+ |
| **dotenv** | Environment Configuration | 16.3+ |

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **OrientDB** server running and accessible
- **SSL certificates** (for production deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=9000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=your_db_password
DB_NAME=gamedb
DB_USER=admin

# SSL Configuration (Production only)
SSL_KEY_PATH=./certs/privkey.pem
SSL_CERT_PATH=./certs/fullchain.pem
```

### 4. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on the configured port (default: 9000) and display available endpoints.

## 📚 API Documentation

### Base URL
- **Development:** `http://localhost:9000`
- **Production:** `https://api.fouhou.stoyanography.com:9000`

### 🎯 Core Endpoints

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

#### Get Leaderboard
```http
GET /api/scores/{gameID}?limit=50&offset=0
```

#### Get Top Scores
```http
GET /api/scores/top/{gameID}?limit=10
```

#### Get User Scores
```http
GET /api/scores/user/{userID}
```

#### Get User Rank
```http
GET /api/scores/user/{userID}/rank/{gameID}
```

### 📊 Batch Operations

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

#### Force Ranking Update
```http
POST /api/force-update-rankings/{gameID}
```

#### Check Batch Status
```http
GET /api/batch-status
```

### 🗑️ Data Management

#### Delete User Scores
```http
DELETE /api/scores/{gameID}/{userID}
```

#### Test Database Connection
```http
GET /api/test-db
```

## 🏗️ Project Structure

```
Fouhou-backend/
├── 📁 api/                 # API route handlers
│   └── scoreAPI.js         # Score management endpoints
├── 📁 Database/            # Database utilities
│   └── databaseClass.js    # OrientDB connection class
├── 📄 app.js              # Main application entry point
├── 📄 package.json        # Project dependencies and scripts
├── 📄 .gitignore          # Git ignore rules
└── 📄 README.md           # This file
```

## 🎛️ Configuration

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

### Batch Processing Configuration

The intelligent batching system can be configured in `api/scoreAPI.js`:

```javascript
this.config = {
  maxBatchSize: 10,         // Maximum scores per batch
  batchTimeoutMs: 2000,     // Maximum wait time before processing
  cooldownMs: 500,          // Cooldown between batch updates
  highLoadThreshold: 50     // Threshold for high-load mode
};
```

## 🐳 Database Setup

### OrientDB Installation

1. **Download OrientDB** from [orientdb.org](https://orientdb.org/download)
2. **Extract and Start:**
   ```bash
   cd orientdb-*
   bin/server.sh
   ```
3. **Create Database:**
   - Open OrientDB Studio: `http://localhost:2480`
   - Create new database named `gamedb`
   - Create user with appropriate permissions

### Database Schema

The API expects a `GameScores` collection with the following structure:
```sql
CREATE CLASS GameScores
CREATE PROPERTY GameScores.GameID STRING
CREATE PROPERTY GameScores.UserID STRING  
CREATE PROPERTY GameScores.Username STRING
CREATE PROPERTY GameScores.Score INTEGER
CREATE PROPERTY GameScores.Ranking INTEGER
CREATE INDEX GameScores.GameID_UserID ON GameScores (GameID, UserID) UNIQUE
```

## 🚀 Deployment

### Development Deployment
```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Production Deployment

1. **Prepare SSL Certificates:**
   ```bash
   mkdir certs
   # Copy your SSL certificates to certs/
   cp /path/to/privkey.pem certs/
   cp /path/to/fullchain.pem certs/
   ```

2. **Set Environment Variables:**
   ```bash
   export NODE_ENV=production
   export DB_PASSWORD=your_secure_password
   # ... other variables
   ```

3. **Start Production Server:**
   ```bash
   npm start
   ```

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start app.js --name "fouhou-backend"

# Monitor
pm2 monitor
```

## 📊 Monitoring and Logging

### Health Checks
- **Health Endpoint:** `/api/health`
- **Database Test:** `/api/test-db`
- **Batch Status:** `/api/batch-status`

### Request Logging
All requests are logged with:
- Timestamp
- HTTP method and path
- Origin header
- User-Agent

### Error Handling
- Global error handler for uncaught exceptions
- Graceful shutdown on SIGTERM/SIGINT
- Environment-specific error details

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add appropriate error handling
- Update documentation for new features
- Test your changes thoroughly

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed:**
- Verify OrientDB is running
- Check database credentials in `.env`
- Ensure database exists

**SSL Certificate Errors:**
- Verify certificate paths are correct
- Check file permissions
- Ensure certificates are valid

**Port Already in Use:**
- Change `PORT` in `.env` file
- Kill process using the port: `lsof -ti:9000 | xargs kill`

### Debug Mode
Enable verbose logging by setting:
```bash
export NODE_ENV=development
```

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Denislav Stoyanov**
- GitHub: [@StoyanovDenislav](https://github.com/StoyanovDenislav)

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database powered by [OrientDB](https://orientdb.org/)
- Thanks to the open-source community

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[Report Bug](https://github.com/StoyanovDenislav/Fouhou-backend/issues) · [Request Feature](https://github.com/StoyanovDenislav/Fouhou-backend/issues) · [Documentation](https://github.com/StoyanovDenislav/Fouhou-backend/wiki)

</div>