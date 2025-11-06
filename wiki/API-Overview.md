# 📖 API Overview

Complete reference for the Fouhou Backend API - a high-performance Game Scores API designed for real-time leaderboards and score tracking.

## 🌐 Base URLs

| Environment | URL |
|-------------|-----|
| **Development** | `http://localhost:9000` |
| **Production** | `https://api.fouhou.stoyanography.com:9000` |

## 🔗 Core Endpoints

### 🏥 Health & Status

#### Health Check
**`GET /api/health`**

Check the API server and database status.

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

#### Test Database Connection
**`GET /api/test-db`**

Test the OrientDB connection and get database statistics.

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "totalScores": 1250,
  "fouhouScores": 842,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 🎯 Score Management

#### Submit Score
**`POST /api/scores`**

Submit a new score for a player in a specific game.

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
    "rid": "#12:45",
    "gameID": "fouhou-v1",
    "score": 1500,
    "userID": "user123",
    "username": "PlayerOne",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "note": "Rankings will update via batch processing"
  }
}
```

#### Bulk Score Submission
**`POST /api/scores/bulk`**

Submit multiple scores in a single request for better performance.

**Request Body:**
```json
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
  "message": "Bulk scores submitted successfully",
  "processed": 2,
  "data": {
    "gameIDs": ["fouhou-v1"],
    "totalScores": 2,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 📊 Leaderboards & Rankings

#### Get Leaderboard
**`GET /api/scores/{gameID}`**

Get the complete leaderboard for a specific game.

**Parameters:**
- `gameID` (path) - The game identifier
- `limit` (query) - Number of results (default: 50, max: 100)
- `offset` (query) - Starting position (default: 0)

**Example:**
```
GET /api/scores/fouhou-v1?limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameID": "fouhou-v1",
    "scores": [
      {
        "GameID": "fouhou-v1",
        "Ranking": 1,
        "Score": 2500,
        "UserID": "user456",
        "Username": "TopPlayer"
      },
      {
        "GameID": "fouhou-v1",
        "Ranking": 2,
        "Score": 2300,
        "UserID": "user789",
        "Username": "SecondPlace"
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 156,
      "hasMore": true
    }
  }
}
```

#### Get Top Scores
**`GET /api/scores/top/{gameID}`**

Get the top scores for a specific game (optimized query).

**Parameters:**
- `gameID` (path) - The game identifier
- `limit` (query) - Number of top scores (default: 10, max: 50)

**Example:**
```
GET /api/scores/top/fouhou-v1?limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameID": "fouhou-v1",
    "topScores": [
      {
        "GameID": "fouhou-v1",
        "Ranking": 1,
        "Score": 2500,
        "UserID": "user456",
        "Username": "TopPlayer"
      }
    ],
    "count": 5,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get User Scores
**`GET /api/scores/user/{userID}`**

Get all scores for a specific user across all games.

**Parameters:**
- `userID` (path) - The user identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "userID": "user123",
    "scores": [
      {
        "GameID": "fouhou-v1",
        "Score": 1500,
        "Ranking": 15,
        "Username": "PlayerOne"
      }
    ],
    "totalGames": 1,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get User Rank
**`GET /api/scores/user/{userID}/rank/{gameID}`**

Get a user's current rank in a specific game.

**Parameters:**
- `userID` (path) - The user identifier
- `gameID` (path) - The game identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "userID": "user123",
    "gameID": "fouhou-v1",
    "currentRank": 15,
    "totalPlayers": 156,
    "percentile": 90.4,
    "bestScore": 1500,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 🔄 Batch Operations

#### Get Batch Status
**`GET /api/batch-status`**

Check the status of the batch processing system.

**Response:**
```json
{
  "success": true,
  "data": {
    "batchProcessor": {
      "pendingBatches": ["fouhou-v1", "game-2"],
      "processingGames": ["game-3"],
      "config": {
        "maxBatchSize": 10,
        "batchTimeoutMs": 2000,
        "cooldownMs": 500,
        "highLoadThreshold": 50
      }
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Force Ranking Update
**`POST /api/force-update-rankings/{gameID}`**

Manually trigger a ranking update for a specific game.

**Parameters:**
- `gameID` (path) - The game identifier

**Response:**
```json
{
  "success": true,
  "message": "Rankings update triggered",
  "gameID": "fouhou-v1",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 🗑️ Data Management

#### Delete User Scores
**`DELETE /api/scores/{gameID}/{userID}`**

Delete all scores for a specific user in a specific game.

**Parameters:**
- `gameID` (path) - The game identifier
- `userID` (path) - The user identifier

**Response:**
```json
{
  "success": true,
  "message": "Scores deleted successfully",
  "deletedCount": 3
}
```

## 🔒 Request Headers

### Required Headers
```http
Content-Type: application/json
```

### Optional Headers
```http
Origin: https://yourgame.com
User-Agent: YourGame/1.0
```

## 📝 Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
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

## 🚨 Error Codes

| HTTP Code | Description |
|-----------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Endpoint or resource not found |
| `500` | Internal Server Error - Server-side error |

## 🔄 Rate Limiting

The API implements intelligent rate limiting:

- **Default**: 100 requests per minute per IP
- **Burst**: Up to 20 requests per second
- **Headers**: Rate limit info in response headers

## 📚 Related Documentation

- [Error Handling Guide](Error-Handling.md)
- [Authentication & Security](Authentication.md)
- [Integration Examples](Examples.md)
- [Performance Optimization](Performance.md)

---

**📊 API Status**: Operational | **⚡ Response Time**: <100ms | **🔄 Uptime**: 99.9%