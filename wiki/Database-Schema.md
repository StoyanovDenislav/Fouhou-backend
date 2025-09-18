# 🗄️ Database Schema

Complete documentation for the OrientDB database schema used by the Fouhou Backend.

## 📊 Database Overview

**Database Type**: OrientDB (Multi-Model Graph Database)  
**Default Database Name**: `gamedb`  
**Schema Model**: Document-oriented with graph capabilities  
**Version**: 3.x+

## 🏗️ Schema Structure

### Primary Class: `GameScores`

The core data structure for storing game scores and player rankings.

```sql
CREATE CLASS GameScores EXTENDS V
```

#### Properties

| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| `GameID` | STRING | Unique identifier for the game | Required, Indexed |
| `UserID` | STRING | Unique identifier for the user | Required, Indexed |
| `Username` | STRING | Display name for the user | Required |
| `Score` | DOUBLE | Player's score value | Required, Numeric |
| `Ranking` | INTEGER | Player's current rank in the game | Auto-calculated |
| `Timestamp` | DATETIME | When the score was submitted | Auto-generated |

#### Schema Definition

```sql
-- Create the main class
CREATE CLASS GameScores EXTENDS V

-- Define properties with types
CREATE PROPERTY GameScores.GameID STRING
CREATE PROPERTY GameScores.UserID STRING  
CREATE PROPERTY GameScores.Username STRING
CREATE PROPERTY GameScores.Score DOUBLE
CREATE PROPERTY GameScores.Ranking INTEGER
CREATE PROPERTY GameScores.Timestamp DATETIME

-- Set mandatory properties
ALTER PROPERTY GameScores.GameID MANDATORY true
ALTER PROPERTY GameScores.UserID MANDATORY true
ALTER PROPERTY GameScores.Username MANDATORY true
ALTER PROPERTY GameScores.Score MANDATORY true

-- Set default values
ALTER PROPERTY GameScores.Timestamp DEFAULT sysdate()
```

## 🔍 Indexes

Strategic indexing for optimal query performance:

### Composite Index: GameID + Score
```sql
CREATE INDEX GameScores.GameID_Score ON GameScores (GameID, Score) NOTUNIQUE
```
**Purpose**: Optimizes leaderboard queries sorted by score  
**Usage**: `GET /api/scores/{gameID}` endpoints

### Single Index: UserID
```sql
CREATE INDEX GameScores.UserID ON GameScores (UserID) NOTUNIQUE
```
**Purpose**: Fast user score lookups  
**Usage**: `GET /api/scores/user/{userID}` endpoints

### Unique Composite Index: GameID + UserID
```sql
CREATE INDEX GameScores.GameID_UserID ON GameScores (GameID, UserID) UNIQUE
```
**Purpose**: Ensures one score per user per game  
**Usage**: Prevents duplicate score entries

### Performance Index: Ranking
```sql
CREATE INDEX GameScores.Ranking ON GameScores (Ranking) NOTUNIQUE
```
**Purpose**: Fast ranking-based queries  
**Usage**: Top scores and percentile calculations

## 📝 Sample Data Structure

### Example Record
```json
{
  "@rid": "#12:45",
  "@class": "GameScores",
  "GameID": "fouhou-v1",
  "UserID": "user123",
  "Username": "ProGamer2024",
  "Score": 2500.75,
  "Ranking": 15,
  "Timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Data Types Details

#### GameID
- **Format**: String identifier
- **Examples**: `"fouhou-v1"`, `"puzzle-game-2"`, `"racing-alpha"`
- **Pattern**: Alphanumeric with hyphens
- **Max Length**: 64 characters

#### UserID  
- **Format**: Unique string identifier
- **Examples**: `"user123"`, `"player_abc"`, `"uuid-string"`
- **Pattern**: Alphanumeric with underscores/hyphens
- **Max Length**: 64 characters

#### Username
- **Format**: Display name string
- **Examples**: `"ProGamer2024"`, `"Alice Smith"`, `"龍王"`
- **Pattern**: Unicode characters allowed
- **Max Length**: 32 characters

#### Score
- **Format**: Double precision floating point
- **Range**: -∞ to +∞ (typically 0 to 999999999)
- **Precision**: Up to 15 decimal places
- **Examples**: `1500`, `2500.75`, `999999.999`

#### Ranking
- **Format**: Integer
- **Range**: 1 to N (where N is total players)
- **Auto-calculated**: Updated by batch processor
- **Examples**: `1`, `15`, `1000`

## 🔄 Data Operations

### INSERT Operations
```sql
-- Insert new score
INSERT INTO GameScores 
SET GameID = 'fouhou-v1',
    UserID = 'user123',
    Username = 'ProGamer',
    Score = 1500,
    Timestamp = sysdate()
```

### UPDATE Operations
```sql
-- Update score for existing user
UPDATE GameScores 
SET Score = 2000,
    Timestamp = sysdate()
WHERE GameID = 'fouhou-v1' 
  AND UserID = 'user123'
```

### Query Operations

#### Get Leaderboard
```sql
SELECT GameID, Ranking, Score, UserID, Username
FROM GameScores 
WHERE GameID = :gameID 
ORDER BY Score DESC
LIMIT :limit
OFFSET :offset
```

#### Get User's Best Score
```sql
SELECT Score, Ranking
FROM GameScores 
WHERE GameID = :gameID 
  AND UserID = :userID
ORDER BY Score DESC
LIMIT 1
```

#### Get User Rank
```sql
SELECT COUNT(*) as rank
FROM GameScores 
WHERE GameID = :gameID 
  AND Score > (
    SELECT Score 
    FROM GameScores 
    WHERE GameID = :gameID 
      AND UserID = :userID
  )
```

## 🎯 Ranking System

### Ranking Calculation Logic

The ranking system uses a **dense ranking** approach:

1. **Score-based**: Higher scores get better (lower) ranks
2. **Tie Handling**: Equal scores receive the same rank
3. **Gap-free**: No gaps in ranking sequence
4. **Batch Updates**: Rankings updated asynchronously

### Ranking Update Query
```sql
-- Update rankings for a specific game
LET $scores = (
  SELECT @rid, Score 
  FROM GameScores 
  WHERE GameID = :gameID 
  ORDER BY Score DESC
);

FOREACH ($score IN $scores) {
  LET $rank = ($scores.indexOf($score) + 1);
  UPDATE $score.@rid SET Ranking = $rank;
}
```

## 📊 Performance Considerations

### Query Optimization

#### Efficient Leaderboard Query
```sql
-- Optimized with composite index
SELECT GameID, Ranking, Score, UserID, Username
FROM GameScores USE INDEX GameScores.GameID_Score
WHERE GameID = :gameID 
ORDER BY Score DESC
LIMIT 50
```

#### User Score Lookup
```sql
-- Optimized with UserID index
SELECT * 
FROM GameScores USE INDEX GameScores.UserID
WHERE UserID = :userID
```

### Index Usage Guidelines

1. **Always use GameID in WHERE clauses** for game-specific queries
2. **Include Score in ORDER BY** to utilize composite index
3. **Limit result sets** to prevent memory issues
4. **Use specific indexes** with USE INDEX hint when needed

## 🔧 Database Configuration

### Connection Configuration
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

### OrientDB Server Settings
```
# orientdb-server-config.xml
<network>
  <protocols>
    <protocol name="binary" implementation="com.orientechnologies.orient.server.network.protocol.binary.ONetworkProtocolBinary"/>
    <protocol name="http" implementation="com.orientechnologies.orient.server.network.protocol.http.ONetworkProtocolHttpDb"/>
  </protocols>
  <listeners>
    <listener ip-address="0.0.0.0" port-range="2424-2430" protocol="binary"/>
    <listener ip-address="0.0.0.0" port-range="2480-2490" protocol="http"/>
  </listeners>
</network>
```

## 🚀 Database Setup Script

### Complete Setup Script
```sql
-- Create database (run as server admin)
CREATE DATABASE gamedb plocal admin admin;

-- Connect to database
CONNECT gamedb admin admin;

-- Create the main class
CREATE CLASS GameScores EXTENDS V;

-- Define properties
CREATE PROPERTY GameScores.GameID STRING;
CREATE PROPERTY GameScores.UserID STRING;
CREATE PROPERTY GameScores.Username STRING;
CREATE PROPERTY GameScores.Score DOUBLE;
CREATE PROPERTY GameScores.Ranking INTEGER;
CREATE PROPERTY GameScores.Timestamp DATETIME;

-- Set mandatory properties
ALTER PROPERTY GameScores.GameID MANDATORY true;
ALTER PROPERTY GameScores.UserID MANDATORY true;
ALTER PROPERTY GameScores.Username MANDATORY true;
ALTER PROPERTY GameScores.Score MANDATORY true;

-- Set default timestamp
ALTER PROPERTY GameScores.Timestamp DEFAULT sysdate();

-- Create indexes
CREATE INDEX GameScores.GameID_Score ON GameScores (GameID, Score) NOTUNIQUE;
CREATE INDEX GameScores.UserID ON GameScores (UserID) NOTUNIQUE;
CREATE INDEX GameScores.GameID_UserID ON GameScores (GameID, UserID) UNIQUE;
CREATE INDEX GameScores.Ranking ON GameScores (Ranking) NOTUNIQUE;

-- Insert sample data
INSERT INTO GameScores SET 
  GameID = 'fouhou-v1',
  UserID = 'demo_user',
  Username = 'Demo Player',
  Score = 1000;
```

## 🔍 Monitoring & Maintenance

### Database Health Queries
```sql
-- Check total records
SELECT COUNT(*) as total_scores FROM GameScores;

-- Check scores per game
SELECT GameID, COUNT(*) as score_count 
FROM GameScores 
GROUP BY GameID 
ORDER BY score_count DESC;

-- Check index usage
SELECT name, type, definition 
FROM (SELECT expand(indexes) FROM metadata:indexmanager);
```

### Maintenance Operations
```sql
-- Rebuild indexes
REBUILD INDEX GameScores.GameID_Score;

-- Optimize database
OPTIMIZE DATABASE;

-- Check database integrity
CHECK DATABASE;
```

## 📚 Related Documentation

- [System Architecture](System-Architecture.md) - Overall system design
- [API Overview](API-Overview.md) - API endpoints using this schema
- [Batch Processing](Batch-Processing.md) - Ranking update system
- [Performance Optimization](Performance.md) - Database performance tuning

---

**🗄️ Schema Version**: 1.0 | **📊 Performance**: Optimized | **🔒 Integrity**: Enforced