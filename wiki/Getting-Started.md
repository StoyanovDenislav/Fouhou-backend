# 🚀 Quick Start Guide

Get your Fouhou Backend up and running in just a few minutes!

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OrientDB** server - [Download here](https://orientdb.org/download)
- **Git** - [Download here](https://git-scm.com/)

## 🏃‍♂️ 5-Minute Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
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
DB_PASSWORD=your_orientdb_password
DB_NAME=gamedb
DB_USER=admin

# SSL Configuration (Production only)
# SSL_KEY_PATH=./certs/privkey.pem
# SSL_CERT_PATH=./certs/fullchain.pem
```

### Step 4: Start OrientDB
Make sure your OrientDB server is running:

```bash
# If OrientDB is installed locally
$ORIENTDB_HOME/bin/server.sh

# Or using Docker
docker run -d --name orientdb -p 2424:2424 -p 2480:2480 \
  -e ORIENTDB_ROOT_PASSWORD=your_password \
  orientdb:latest
```

### Step 5: Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

### Step 6: Verify Installation
Open your browser or use curl to test:

```bash
# Health check
curl http://localhost:9000/api/health

# Expected response:
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

## 🎮 Test Your First Score Submission

### Submit a Score
```bash
curl -X POST http://localhost:9000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "gameID": "fouhou-v1",
    "score": 1500,
    "userID": "user123",
    "username": "TestPlayer"
  }'
```

### Get Leaderboard
```bash
curl http://localhost:9000/api/scores/fouhou-v1?limit=10
```

## 🌐 Available Endpoints

Once running, your API will be available at:

| Endpoint | Description |
|----------|-------------|
| `GET /` | Root endpoint with API info |
| `GET /api/health` | Health check and status |
| `POST /api/scores` | Submit a new score |
| `GET /api/scores/{gameID}` | Get leaderboard |
| `GET /api/scores/top/{gameID}` | Get top scores |
| `GET /api/test-db` | Test database connection |

## 🎯 Console Output

When running successfully, you should see:
```
🔧 Starting Game Scores API server in DEVELOPMENT mode (HTTP)
🚀 Game Scores API server running on port 9000 in development mode
📊 Health check: http://localhost:9000/api/health
🌐 Root endpoint: http://localhost:9000/
📈 Scores API: http://localhost:9000/api/scores
🔧 Test DB: http://localhost:9000/api/test-db
```

## 🚨 Common Issues

### Database Connection Failed
```
❌ Database connection failed
```
**Solution**: Ensure OrientDB is running and credentials are correct

### Port Already in Use
```
❌ Error: listen EADDRINUSE: address already in use :::9000
```
**Solution**: Change the PORT in your `.env` file or stop the process using port 9000

### Module Not Found
```
❌ Cannot find module 'orientjs'
```
**Solution**: Run `npm install` to install dependencies

## 📚 Next Steps

Now that your API is running:

1. **[Read the API Documentation](API-Overview.md)** - Learn about all available endpoints
2. **[Set up your Database Schema](Database-Schema.md)** - Configure your database structure  
3. **[Explore Examples](Examples.md)** - See real-world usage examples
4. **[Deploy to Production](Production-Deployment.md)** - Take it live!

## 🆘 Need Help?

- Check the [Troubleshooting Guide](Troubleshooting.md)
- Review the [FAQ](FAQ.md)
- Open an [issue on GitHub](https://github.com/StoyanovDenislav/Fouhou-backend/issues)

---

**🎉 Congratulations! Your Fouhou Backend is now running!**