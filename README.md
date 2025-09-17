# 🎮 Fouhou Backend - Game Scores API Server

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue.svg)](https://expressjs.com/)
[![OrientDB](https://img.shields.io/badge/OrientDB-3.0%2B-orange.svg)](https://orientdb.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A robust and scalable REST API server for managing game scores, leaderboards, and player rankings with real-time batch processing capabilities.

## ✨ Features

- 🏆 **Leaderboard Management** - Create and maintain game leaderboards with automatic ranking
- ⚡ **Batch Processing** - Smart ranking updates with configurable batch processing for optimal performance
- 🔄 **Real-time Score Submission** - Submit scores individually or in bulk with immediate feedback
- 🗄️ **OrientDB Integration** - Powerful graph database for complex score relationships
- 🛡️ **Security & CORS** - Built-in security middleware and CORS support
- 📊 **Health Monitoring** - Health check endpoints and batch processing status monitoring
- 🌐 **Multi-Environment** - Support for both development (HTTP) and production (HTTPS) modes
- 📝 **Request Logging** - Comprehensive request logging with timestamps and user agent tracking

## 🚀 Quick Start

### Prerequisites

- **Node.js** 14+ 
- **npm** or **yarn**
- **OrientDB** server running

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

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=2424
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=gamedb
   DB_USER=admin
   DB_PASSWORD=admin_password
   
   # Server Configuration
   NODE_ENV=development
   PORT=9000
   HOST=localhost
   
   # SSL Configuration (Production only)
   SSL_KEY_PATH=./certs/privkey.pem
   SSL_CERT_PATH=./certs/fullchain.pem
   ```

4. **Start the server**
   
   For development:
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:9000`
- **Production**: `https://api.fouhou.stoyanography.com:9000`

### Endpoints

#### 🏠 Root Endpoint
```http
GET /
```
Returns server information and status.

#### 🏥 Health Check
```http
GET /api/health
```
Returns API health status and batch processor information.

#### 🧪 Database Test
```http
GET /api/test-db
```
Tests database connectivity and returns connection status.

#### 📊 Score Management

##### Get Leaderboard
```http
GET /api/scores/:gameID?limit=50&offset=0
```
Retrieves the leaderboard for a specific game.

**Parameters:**
- `gameID` (path) - Game identifier
- `limit` (query, optional) - Number of results (default: 50)
- `offset` (query, optional) - Pagination offset (default: 0)

##### Get Top Scores
```http
GET /api/scores/top/:gameID?limit=10
```
Gets the top scores for a specific game.

##### Get User Scores
```http
GET /api/scores/user/:userID?limit=50&offset=0
```
Retrieves all scores for a specific user across all games.

##### Get User Rank
```http
GET /api/scores/user/:userID/rank/:gameID
```
Gets a specific user's rank in a particular game.

##### Submit Score
```http
POST /api/scores
Content-Type: application/json

{
  "gameID": "fouhou-v1",
  "score": 12500,
  "userID": "user123",
  "username": "PlayerName"
}
```

##### Bulk Score Submission
```http
POST /api/scores/bulk
Content-Type: application/json

{
  "scores": [
    {
      "gameID": "fouhou-v1",
      "score": 12500,
      "userID": "user123",
      "username": "PlayerName"
    }
  ]
}
```

##### Delete User Scores
```http
DELETE /api/scores/:gameID/:userID
```
Deletes all scores for a specific user in a particular game.

##### Force Update Rankings
```http
POST /api/force-update-rankings/:gameID
```
Manually triggers ranking updates for a specific game.

#### 📈 Batch Processing

##### Get Batch Status
```http
GET /api/batch-status
```
Returns current batch processing status and pending operations.

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: OrientDB
- **Security**: CORS, Helmet
- **Environment**: dotenv
- **Process Management**: Nodemon (development)
- **SSL/TLS**: Native HTTPS support

## 📁 Project Structure

```
Fouhou-backend/
│
├── 📁 api/
│   └── scoreAPI.js          # Score management API routes
│
├── 📁 Database/
│   └── databaseClass.js     # OrientDB connection wrapper
│
├── 📄 app.js               # Main application server
├── 📄 package.json         # Dependencies and scripts
├── 📄 .gitignore          # Git ignore rules
└── 📄 README.md           # This file
```

## ⚙️ Configuration Options

### Batch Processing Configuration

The server includes a smart batch processing system for ranking updates:

```javascript
{
  maxBatchSize: 10,        // Maximum scores per batch
  batchTimeoutMs: 2000,    // Maximum wait time for batching
  cooldownMs: 500,         // Cooldown between batches
  highLoadThreshold: 50    // Threshold for high-load mode
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `9000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `2424` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `gamedb` |

## 🎯 Usage Examples

### JavaScript/Node.js Client

```javascript
const axios = require('axios');

// Submit a score
const submitScore = async (gameID, score, userID, username) => {
  try {
    const response = await axios.post('http://localhost:9000/api/scores', {
      gameID,
      score,
      userID,
      username
    });
    console.log('Score submitted:', response.data);
  } catch (error) {
    console.error('Error submitting score:', error.response?.data);
  }
};

// Get leaderboard
const getLeaderboard = async (gameID, limit = 10) => {
  try {
    const response = await axios.get(`http://localhost:9000/api/scores/${gameID}?limit=${limit}`);
    console.log('Leaderboard:', response.data);
  } catch (error) {
    console.error('Error fetching leaderboard:', error.response?.data);
  }
};

// Usage
submitScore('fouhou-v1', 15000, 'player123', 'ProGamer');
getLeaderboard('fouhou-v1', 20);
```

### cURL Examples

```bash
# Submit a score
curl -X POST http://localhost:9000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "gameID": "fouhou-v1",
    "score": 12500,
    "userID": "user123",
    "username": "PlayerName"
  }'

# Get leaderboard
curl http://localhost:9000/api/scores/fouhou-v1?limit=10

# Check server health
curl http://localhost:9000/api/health
```

## 🔧 Development

### Running in Development Mode

```bash
npm run dev
```

This starts the server with:
- Hot reloading via nodemon
- HTTP protocol
- Enhanced error messages
- Request logging

### Database Setup

Ensure OrientDB is running and accessible. The application will automatically connect using the configured credentials.

Example OrientDB setup:
```javascript
const Database = require('./Database/databaseClass');
const dbInstance = new Database('localhost', 2424, 'root', 'password');
const db = dbInstance.useDatabase('gamedb', 'admin', 'admin');
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify OrientDB server is running
- Check database credentials in `.env` file
- Ensure database exists and is accessible

**Port Already in Use**
- Change the `PORT` environment variable
- Check for other processes using the port: `lsof -i :9000`

**SSL Certificate Issues (Production)**
- Verify SSL certificate paths are correct
- Ensure certificates are valid and not expired
- Check file permissions for certificate files

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Made with ❤️ for the gaming community**