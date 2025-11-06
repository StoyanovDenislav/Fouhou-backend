# ⚡ Batch Processing System

Deep dive into the intelligent batch processing system that powers the Fouhou Backend's high-performance ranking calculations.

## 🎯 Overview

The Batch Processing System is the core performance optimization feature that enables the Fouhou Backend to handle thousands of score submissions while maintaining responsive ranking updates.

### Key Benefits
- **Non-blocking submissions** - Immediate API responses
- **Intelligent batching** - Optimal database operations
- **Load adaptation** - Scales with traffic patterns
- **Resource efficiency** - Minimizes database overhead

## 🏗️ Architecture

### Core Components

```javascript
class RankingBatchProcessor {
  constructor() {
    this.pendingGames = new Map();      // Game queues
    this.isProcessing = new Set();      // Processing locks
    this.config = { /* ... */ };       // Configuration
  }
}
```

### Processing Flow

```
Score Submission → Queue Addition → Smart Triggering → Batch Processing → Ranking Update
      ↓                ↓               ↓                ↓                 ↓
   Immediate        Add to          Time/Size         Async DB          Rankings
   Response         Queue           Thresholds        Operations        Updated
```

## ⚙️ Configuration

### Default Configuration
```javascript
this.config = {
  maxBatchSize: 10,         // Maximum scores per batch
  batchTimeoutMs: 2000,     // Maximum wait time (2 seconds)
  cooldownMs: 500,          // Cooldown between updates
  highLoadThreshold: 50     // High-load mode trigger
};
```

### Configuration Options

| Parameter | Description | Default | Range | Impact |
|-----------|-------------|---------|-------|--------|
| `maxBatchSize` | Max scores per batch | 10 | 1-100 | Higher = fewer DB calls |
| `batchTimeoutMs` | Max wait time (ms) | 2000 | 100-10000 | Lower = faster updates |
| `cooldownMs` | Cooldown between batches | 500 | 0-5000 | Prevents DB overload |
| `highLoadThreshold` | High-load trigger | 50 | 10-1000 | Earlier aggressive batching |

### Environment Configuration
```env
# In .env file
BATCH_MAX_SIZE=10
BATCH_TIMEOUT_MS=2000
BATCH_COOLDOWN_MS=500
HIGH_LOAD_THRESHOLD=50
```

## 🔄 Batch Triggering Logic

### Trigger Conditions

1. **Size Threshold**: Batch reaches `maxBatchSize`
2. **Time Threshold**: `batchTimeoutMs` elapsed since first submission
3. **High Load Mode**: Total pending batches exceed `highLoadThreshold`

### Smart Triggering Algorithm

```javascript
addScoreSubmission(gameID) {
  const now = Date.now();
  
  if (!this.pendingGames.has(gameID)) {
    // First submission for this game
    this.pendingGames.set(gameID, {
      firstSubmission: now,
      lastSubmission: now,
      batchSize: 1,
      timeout: this.scheduleTimeout(gameID)
    });
  } else {
    // Additional submission
    const batch = this.pendingGames.get(gameID);
    batch.batchSize++;
    batch.lastSubmission = now;
    
    // Check size threshold
    if (batch.batchSize >= this.config.maxBatchSize) {
      this.triggerBatchUpdate(gameID);
    }
  }
  
  // Check high-load mode
  if (this.getTotalPendingBatches() >= this.config.highLoadThreshold) {
    this.enableHighLoadMode();
  }
}
```

## 🚀 Processing Modes

### Normal Mode
- **Trigger**: Size or time thresholds
- **Batch Size**: Up to `maxBatchSize`
- **Timeout**: Full `batchTimeoutMs`
- **Strategy**: Balanced performance

### High Load Mode
- **Trigger**: Pending batches > `highLoadThreshold`
- **Batch Size**: Aggressive batching
- **Timeout**: Reduced timeout (50% of normal)
- **Strategy**: Throughput prioritized

```javascript
enableHighLoadMode() {
  console.log('🔥 High load detected - enabling aggressive batching');
  
  // Trigger all pending batches immediately
  for (const gameID of this.pendingGames.keys()) {
    if (!this.isProcessing.has(gameID)) {
      this.triggerBatchUpdate(gameID);
    }
  }
}
```

## 🔍 Ranking Calculation

### Dense Ranking Algorithm

The system uses **dense ranking** where equal scores receive the same rank with no gaps:

```sql
-- Ranking update query
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

### Ranking Examples

| Score | Dense Rank | Standard Rank |
|-------|------------|---------------|
| 1000  | 1          | 1             |
| 1000  | 1          | 1             |
| 950   | 2          | 3             |
| 900   | 3          | 4             |

### Batch Ranking Process

1. **Collect Scores**: Gather all scores for the game
2. **Sort Descending**: Order by score (highest first)
3. **Calculate Ranks**: Assign dense rankings
4. **Bulk Update**: Update all rankings in single transaction

## 📊 Performance Metrics

### Batch Processing Statistics

```javascript
getStatus() {
  return {
    pendingBatches: Array.from(this.pendingGames.keys()),
    processingGames: Array.from(this.isProcessing),
    totalPendingSubmissions: this.getTotalPendingSubmissions(),
    averageBatchSize: this.getAverageBatchSize(),
    processingRate: this.getProcessingRate(),
    config: this.config
  };
}
```

### Performance Indicators

| Metric | Description | Good Range |
|--------|-------------|------------|
| **Pending Batches** | Games awaiting processing | 0-10 |
| **Processing Games** | Currently processing | 0-3 |
| **Avg Batch Size** | Average scores per batch | 5-15 |
| **Processing Rate** | Batches per minute | 10-100 |

### Monitoring Endpoint

```http
GET /api/batch-status
```

Response:
```json
{
  "success": true,
  "data": {
    "batchProcessor": {
      "pendingBatches": ["fouhou-v1", "game-2"],
      "processingGames": ["game-3"],
      "totalPendingSubmissions": 25,
      "averageBatchSize": 8.5,
      "processingRate": 45,
      "config": {
        "maxBatchSize": 10,
        "batchTimeoutMs": 2000,
        "cooldownMs": 500,
        "highLoadThreshold": 50
      }
    }
  }
}
```

## 🔧 Manual Operations

### Force Ranking Update

Manually trigger ranking update for a specific game:

```http
POST /api/force-update-rankings/{gameID}
```

Implementation:
```javascript
router.post('/force-update-rankings/:gameID', async (req, res) => {
  try {
    const { gameID } = req.params;
    
    // Force immediate processing
    await batchProcessor.forceUpdateRankings(gameID);
    
    res.json({
      success: true,
      message: 'Rankings update triggered',
      gameID: gameID
    });
  } catch (error) {
    handleError(res, error, 'Failed to trigger ranking update');
  }
});
```

### Batch Configuration Update

Update batch processing configuration at runtime:

```javascript
updateConfig(newConfig) {
  this.config = { ...this.config, ...newConfig };
  console.log('🔧 Batch processor config updated:', this.config);
}
```

## 🛡️ Error Handling

### Resilient Processing

```javascript
async processBatch(gameID) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await this.updateRankings(gameID);
      break; // Success
    } catch (error) {
      attempt++;
      console.error(`❌ Batch processing attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        // Final failure - log and continue
        console.error(`💥 Batch processing failed for ${gameID} after ${maxRetries} attempts`);
        this.handleProcessingFailure(gameID, error);
      } else {
        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }
}
```

### Failure Recovery

1. **Retry Logic**: Exponential backoff with max retries
2. **Error Logging**: Comprehensive error tracking
3. **Graceful Degradation**: Continue processing other games
4. **Manual Recovery**: Force update endpoints available

## 🔍 Debugging & Monitoring

### Debug Logging

Enable detailed batch processing logs:

```javascript
// Enable debug mode
this.debugMode = process.env.BATCH_DEBUG === 'true';

debugLog(message, data = {}) {
  if (this.debugMode) {
    console.log(`🔍 [BATCH] ${message}`, data);
  }
}
```

### Log Examples

```
🔍 [BATCH] Score added to queue: { gameID: 'fouhou-v1', batchSize: 5 }
🔍 [BATCH] Size threshold reached: { gameID: 'fouhou-v1', size: 10 }
🔍 [BATCH] Timeout triggered: { gameID: 'game-2', elapsed: 2000ms }
🔍 [BATCH] High load mode activated: { totalPending: 52 }
🔍 [BATCH] Rankings updated: { gameID: 'fouhou-v1', updated: 10, duration: 45ms }
```

### Performance Monitoring

```javascript
// Add timing metrics
const startTime = Date.now();
await this.updateRankings(gameID);
const duration = Date.now() - startTime;

console.log(`⚡ Rankings updated for ${gameID} in ${duration}ms`);
```

## 🎯 Optimization Strategies

### Load-Based Optimization

1. **Traffic Patterns**: Adapt to peak hours
2. **Batch Sizing**: Dynamic batch size adjustment
3. **Timeout Reduction**: Faster processing under load
4. **Resource Pooling**: Efficient database connections

### Database Optimization

1. **Index Usage**: Strategic index utilization
2. **Bulk Operations**: Minimize individual queries
3. **Transaction Batching**: Group related operations
4. **Connection Pooling**: Reuse database connections

### Memory Optimization

1. **Queue Management**: Efficient data structures
2. **Memory Cleanup**: Regular garbage collection
3. **Resource Limits**: Prevent memory leaks

## 📚 Related Documentation

- [System Architecture](System-Architecture.md) - Overall system design
- [Database Schema](Database-Schema.md) - Database optimization
- [Performance Optimization](Performance.md) - General performance tips
- [API Overview](API-Overview.md) - API endpoints using batch processing

---

**⚡ Processing Status**: Optimized | **🔄 Throughput**: High | **📊 Efficiency**: Maximum