# API Quick Reference

## Base URL
- Development: `http://localhost:9000`
- Production: `https://api.fouhou.stoyanography.com:9000`

## Endpoints

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server info |
| GET | `/api/health` | Health check |
| GET | `/api/test-db` | Database test |
| GET | `/api/batch-status` | Batch processor status |

### Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scores` | Submit single score |
| POST | `/api/scores/bulk` | Submit multiple scores |
| GET | `/api/scores/:gameID` | Get leaderboard |
| GET | `/api/scores/top/:gameID` | Get top scores |
| DELETE | `/api/scores/:gameID/:userID` | Delete user scores |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scores/user/:userID` | Get user scores |
| GET | `/api/scores/user/:userID/rank/:gameID` | Get user rank |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/force-update-rankings/:gameID` | Force ranking update |

## Sample Requests

### Submit Score
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

### Get Leaderboard
```bash
curl "http://localhost:9000/api/scores/fouhou-v1?limit=10&offset=0"
```

### Get User Rank
```bash
curl "http://localhost:9000/api/scores/user/user123/rank/fouhou-v1"
```