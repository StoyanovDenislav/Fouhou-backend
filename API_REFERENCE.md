# 🔌 API Reference

Complete technical reference for the Fouhou Backend API endpoints.

## Base URL

- **Development:** `http://localhost:9000`
- **Production:** `https://api.fouhou.stoyanography.com:9000`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Description of the operation",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Endpoints

### Score Management

#### Submit Score

Submit a single score for a user in a specific game.

**Endpoint:** `POST /api/scores`

**Request Body:**
```json
{
  "gameID": "string",     // Required: Game identifier
  "score": "number",      // Required: User's score
  "userID": "string",     // Required: Unique user identifier
  "username": "string"    // Required: Display name
}
```

**Example Request:**
```bash
curl -X POST http://localhost:9000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "gameID": "fouhou-v1",
    "score": 1500,
    "userID": "user123",
    "username": "PlayerOne"
  }'
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

**Validation Errors:**
- `400 Bad Request` if any required field is missing or invalid type

---

#### Bulk Score Submission

Submit multiple scores in a single request for improved performance.

**Endpoint:** `POST /api/scores/bulk`

**Request Body:**
```json
{
  "scores": [
    {
      "gameID": "string",
      "score": "number", 
      "userID": "string",
      "username": "string"
    }
    // ... more scores
  ]
}
```

**Example Request:**
```bash
curl -X POST http://localhost:9000/api/scores/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "scores": [
      {"gameID": "fouhou-v1", "score": 1500, "userID": "user1", "username": "Player1"},
      {"gameID": "fouhou-v1", "score": 1200, "userID": "user2", "username": "Player2"}
    ]
  }'
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
        "userID": "user1",
        "username": "Player1"
      }
    }
    // ... more results
  ]
}
```

---

### Leaderboards and Rankings

#### Get Leaderboard

Retrieve paginated leaderboard for a specific game.

**Endpoint:** `GET /api/scores/{gameID}`

**Query Parameters:**
- `limit` (optional): Number of scores to return (default: 50, max: 100)
- `offset` (optional): Number of scores to skip (default: 0)

**Example Request:**
```bash
curl "http://localhost:9000/api/scores/fouhou-v1?limit=10&offset=0"
```

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
        "userID": "user456",
        "username": "TopPlayer",
        "isRanked": true
      },
      {
        "ranking": 0,
        "score": 1800,
        "userID": "user789",
        "username": "NewPlayer",
        "isRanked": false
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 42,
      "hasMore": true
    }
  }
}
```

**Notes:**
- `ranking: 0` indicates the score hasn't been processed by batch ranking yet
- `isRanked: false` means the ranking is pending batch processing

---

#### Get Top Scores

Get the top performers for a specific game.

**Endpoint:** `GET /api/scores/top/{gameID}`

**Query Parameters:**
- `limit` (optional): Number of top scores (default: 10, max: 100)

**Example Request:**
```bash
curl "http://localhost:9000/api/scores/top/fouhou-v1?limit=5"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameID": "fouhou-v1",
    "limit": 5,
    "topScores": [
      {
        "ranking": 1,
        "score": 2500,
        "userID": "user456",
        "username": "TopPlayer",
        "isRanked": true
      }
      // ... more top scores
    ]
  }
}
```

---

#### Get User Scores

Retrieve all scores for a specific user, optionally filtered by game.

**Endpoint:** `GET /api/scores/user/{userID}`

**Query Parameters:**
- `gameID` (optional): Filter scores by specific game

**Example Request:**
```bash
# All user scores
curl "http://localhost:9000/api/scores/user/user123"

# User scores for specific game
curl "http://localhost:9000/api/scores/user/user123?gameID=fouhou-v1"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userID": "user123",
    "gameID": "fouhou-v1",
    "scores": [
      {
        "gameID": "fouhou-v1",
        "ranking": 5,
        "score": 1500,
        "username": "PlayerOne",
        "isRanked": true
      }
      // ... more scores
    ],
    "total": 3
  }
}
```

---

#### Get User Rank

Get detailed ranking information for a user in a specific game.

**Endpoint:** `GET /api/scores/user/{userID}/rank/{gameID}`

**Example Request:**
```bash
curl "http://localhost:9000/api/scores/user/user123/rank/fouhou-v1"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userID": "user123",
    "username": "PlayerOne",
    "gameID": "fouhou-v1",
    "bestScore": 1500,
    "rank": 5,
    "totalPlayers": 42,
    "percentile": "88.10",
    "isRanked": true
  }
}
```

**Error Response:**
- `404 Not Found` if user has no scores in the specified game

---

### Administrative Operations

#### Force Ranking Update

Manually trigger batch ranking calculation for a specific game.

**Endpoint:** `POST /api/force-update-rankings/{gameID}`

**Example Request:**
```bash
curl -X POST "http://localhost:9000/api/force-update-rankings/fouhou-v1"
```

**Response:**
```json
{
  "success": true,
  "message": "BULK ranking update completed",
  "gameID": "fouhou-v1",
  "result": {
    "updatedRecords": 42,
    "totalRecords": 42,
    "duration": "156ms"
  }
}
```

**Use Cases:**
- Manual ranking updates during maintenance
- Force immediate ranking after bulk imports
- Testing ranking calculations

---

#### Delete User Scores

Remove all scores for a specific user in a game.

**Endpoint:** `DELETE /api/scores/{gameID}/{userID}`

**Example Request:**
```bash
curl -X DELETE "http://localhost:9000/api/scores/fouhou-v1/user123"
```

**Response:**
```json
{
  "success": true,
  "message": "Scores deleted successfully",
  "deletedCount": 3
}
```

**Notes:**
- Automatically triggers batch processing to recalculate rankings
- Returns the number of records deleted

---

### System Status and Monitoring

#### Health Check

Basic health check endpoint for monitoring system status.

**Endpoint:** `GET /api/health`

**Example Request:**
```bash
curl "http://localhost:9000/api/health"
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

**Use Cases:**
- Load balancer health checks
- Monitoring system integration
- Deployment verification

---

#### Database Connection Test

Test database connectivity and return basic statistics.

**Endpoint:** `GET /api/test-db`

**Example Request:**
```bash
curl "http://localhost:9000/api/test-db"
```

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "totalScores": 1234,
  "fouhouScores": 567,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response:**
- `500 Internal Server Error` if database connection fails

---

#### Batch Processing Status

Get detailed status of the batch processing system.

**Endpoint:** `GET /api/batch-status`

**Example Request:**
```bash
curl "http://localhost:9000/api/batch-status"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchProcessor": {
      "pendingBatches": [
        {
          "gameID": "fouhou-v1",
          "batchSize": 5,
          "waitingTime": 1500,
          "timeUntilProcess": 500
        }
      ],
      "processingGames": ["game-xyz"],
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

**Use Cases:**
- Performance monitoring
- Debugging batch processing issues
- System optimization

---

## Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `200 OK` | Request successful | Normal operation |
| `201 Created` | Resource created | Score submission successful |
| `400 Bad Request` | Invalid request | Missing/invalid fields, validation errors |
| `404 Not Found` | Resource not found | User/game not found, invalid endpoint |
| `500 Internal Server Error` | Server error | Database issues, system errors |

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use based on your requirements.

## CORS Configuration

The API is configured to accept requests from any origin with the following settings:

```javascript
{
  origin: true,           // Allow all origins
  credentials: true,      // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}
```

## Batch Processing Behavior

### Automatic Triggering

Batch processing is automatically triggered when:
1. **Batch Size Threshold**: 10 or more score submissions for a game
2. **Time Threshold**: 2 seconds after the first submission in a batch
3. **Manual Trigger**: Force update endpoint is called

### Processing Flow

1. Score submitted → Immediate insertion with `ranking = 0`
2. Batch processor notified → Submission added to game batch
3. Trigger condition met → Batch processing starts
4. Rankings calculated → Bulk database update
5. Cooldown period → Processor ready for next batch

### Performance Characteristics

- **Batch Size**: Updates processed in chunks of 25 records
- **Timeout**: Maximum 2 seconds wait for batching
- **Cooldown**: 500ms between batch processes
- **Error Recovery**: Failed updates don't stop the batch process

---

*This API reference is based on the current implementation and reflects actual endpoint behavior.*