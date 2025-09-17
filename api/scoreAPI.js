const express = require('express');
const Database = require('../Database/databaseClass');
const router = express.Router();

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 2424,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gamedb',
  dbUser: process.env.DB_USER || 'admin',
  dbPassword: process.env.DB_PASSWORD || 'admin'
};

// Initialize database connection
const dbInstance = new Database(
  DB_CONFIG.host,
  DB_CONFIG.port,
  DB_CONFIG.username,
  DB_CONFIG.password
);

// Utility function to get database connection
const getDB = () => {
  return dbInstance.useDatabase(
    DB_CONFIG.database,
    DB_CONFIG.dbUser,
    DB_CONFIG.dbPassword
  );
};

// Error handling utility
const handleError = (res, error, message = 'Internal server error') => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Validation middleware
const validateScoreData = (req, res, next) => {
  const { gameID, score, userID, username } = req.body;
  
  const errors = [];
  
  if (!gameID || typeof gameID !== 'string') {
    errors.push('GameID is required and must be a string');
  }
  
  if (score === undefined || typeof score !== 'number') {
    errors.push('Score is required and must be a number');
  }
  
  if (!userID || typeof userID !== 'string') {
    errors.push('UserID is required and must be a string');
  }
  
  if (!username || typeof username !== 'string') {
    errors.push('Username is required and must be a string');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};

// BATCHING SYSTEM - Smart ranking updates
class RankingBatchProcessor {
  constructor() {
    this.pendingGames = new Map(); // gameID -> { lastSubmission, timeout, batchSize }
    this.isProcessing = new Set(); // gameIDs currently being processed
    this.config = {
      maxBatchSize: 10,      // REDUCED for testing - force updates faster
      batchTimeoutMs: 2000,  // REDUCED - 2 seconds max wait
      cooldownMs: 500,       // REDUCED - faster cooldown
      highLoadThreshold: 50  // Switch to high-load mode
    };
  }

  addScoreSubmission(gameID) {
    const now = Date.now();
    
    if (!this.pendingGames.has(gameID)) {
      // First submission for this game
      this.pendingGames.set(gameID, {
        firstSubmission: now,
        lastSubmission: now,
        batchSize: 1,
        timeout: null
      });
      
      console.log(`📊 Starting batch for game ${gameID}`);
      this.scheduleBatchUpdate(gameID);
      
    } else {
      // Additional submission
      const batch = this.pendingGames.get(gameID);
      batch.lastSubmission = now;
      batch.batchSize++;
      
      console.log(`📈 Batch size for ${gameID}: ${batch.batchSize}`);
      
      // Force update if batch is too large
      if (batch.batchSize >= this.config.maxBatchSize) {
        console.log(`🚀 Force batch update for ${gameID} - max batch size reached`);
        this.processBatch(gameID);
      }
    }
  }

  scheduleBatchUpdate(gameID) {
    const batch = this.pendingGames.get(gameID);
    if (!batch) return;

    // Clear existing timeout
    if (batch.timeout) {
      clearTimeout(batch.timeout);
    }

    // Schedule new batch update
    batch.timeout = setTimeout(() => {
      this.processBatch(gameID);
    }, this.config.batchTimeoutMs);
  }

  async processBatch(gameID) {
    if (this.isProcessing.has(gameID)) {
      console.log(`⏳ Batch update already in progress for ${gameID}`);
      return;
    }

    const batch = this.pendingGames.get(gameID);
    if (!batch) return;

    this.isProcessing.add(gameID);
    this.pendingGames.delete(gameID);

    if (batch.timeout) {
      clearTimeout(batch.timeout);
    }

    try {
      console.log(`🔄 Processing batch for ${gameID}: ${batch.batchSize} submissions`);
      const startTime = Date.now();
      
      const db = getDB();
      const result = await bulkRankingUpdate(db, gameID);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Batch completed for ${gameID}: ${result.updated}/${result.total} in ${duration}ms`);
      
      // Cooldown before allowing next batch
      setTimeout(() => {
        this.isProcessing.delete(gameID);
      }, this.config.cooldownMs);
      
    } catch (error) {
      console.error(`❌ Batch processing failed for ${gameID}:`, error);
      this.isProcessing.delete(gameID);
    }
  }

  // Get status for monitoring
  getStatus() {
    return {
      pendingBatches: Array.from(this.pendingGames.entries()).map(([gameID, batch]) => ({
        gameID,
        batchSize: batch.batchSize,
        waitingTime: Date.now() - batch.firstSubmission,
        timeUntilProcess: this.config.batchTimeoutMs - (Date.now() - batch.lastSubmission)
      })),
      processingGames: Array.from(this.isProcessing),
      config: this.config
    };
  }
}

// Global batch processor instance
const batchProcessor = new RankingBatchProcessor();

// BULK RANKING UPDATE - Optimized for high volume
async function bulkRankingUpdate(db, gameID) {
  try {
    console.log(`🚀 BULK ranking update for game: ${gameID}`);
    const startTime = Date.now();
    
    // Single query to get all scores sorted
    const scoresQuery = `
      SELECT UserID, Username, Score
      FROM GameScores 
      WHERE GameID = :gameID 
      ORDER BY Score DESC, UserID ASC
    `;
    
    const scores = await db.query(scoresQuery, { params: { gameID } });
    console.log(`📊 Processing ${scores.length} scores in bulk`);
    
    if (scores.length === 0) {
      return { updated: 0, total: 0, duration: 0 };
    }

    // Debug: Log the scores we're about to rank
    console.log(`🔍 DEBUG: First 5 scores to rank:`);
    for (let i = 0; i < Math.min(5, scores.length); i++) {
      console.log(`  ${i + 1}. ${scores[i].Username}: ${scores[i].Score} points`);
    }

    // Build bulk update queries
    const bulkUpdates = [];
    let currentRank = 1;
    
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      
      // Update rank for score changes
      if (i > 0 && scores[i].Score !== scores[i - 1].Score) {
        currentRank = i + 1;
      }
      
      console.log(`🏆 Assigning rank ${currentRank} to ${score.Username} (${score.Score} points)`);
      
      // Prepare bulk update
      bulkUpdates.push({
        query: `UPDATE GameScores SET Ranking = :ranking WHERE GameID = :gameID AND UserID = :userID AND Score = :score`,
        params: {
          ranking: currentRank,
          gameID: gameID,
          userID: score.UserID,
          score: score.Score
        }
      });
    }

    // Execute bulk updates in batches
    const BATCH_SIZE = 25; // Smaller batches for reliability
    let updatedCount = 0;
    
    for (let i = 0; i < bulkUpdates.length; i += BATCH_SIZE) {
      const chunk = bulkUpdates.slice(i, i + BATCH_SIZE);
      
      try {
        // Execute chunk sequentially for reliability
        for (const update of chunk) {
          await db.query(update.query, { params: update.params });
          updatedCount++;
        }
        
        console.log(`✅ Bulk update progress: ${updatedCount}/${bulkUpdates.length}`);
        
      } catch (chunkError) {
        console.error(`❌ Bulk update chunk failed:`, chunkError);
        // Continue with next chunk
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`🏆 BULK ranking update completed: ${updatedCount}/${scores.length} records in ${duration}ms`);
    
    return { updated: updatedCount, total: scores.length, duration };
    
  } catch (error) {
    console.error('❌ Failed BULK ranking update:', error);
    throw error;
  }
}

// Routes

/**
 * POST /scores
 * Bulk-optimized score submission
 */
router.post('/scores', validateScoreData, async (req, res) => {
  try {
    const { gameID, score, userID, username } = req.body;
    const db = getDB();
    
    console.log(`🎮 Score submission: ${username} scored ${score} in ${gameID}`);
    
    // Insert score immediately
    const insertQuery = `
      INSERT INTO GameScores 
      (GameID, Ranking, Score, UserID, Username) 
      VALUES (:gameID, 0, :score, :userID, :username)
    `;
    
    const result = await db.query(insertQuery, { 
      params: { gameID, score, userID, username } 
    });
    
    const newRid = result[0]['@rid'];
    console.log(`✅ Score inserted: ${newRid}`);
    
    // Add to batch processor
    batchProcessor.addScoreSubmission(gameID);
    
    // Return immediate response
    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        rid: newRid,
        gameID,
        score,
        userID,
        username,
        timestamp: new Date().toISOString(),
        note: 'Rankings will update via batch processing'
      }
    });
    
  } catch (error) {
    console.error('Score submission error:', error);
    handleError(res, error, 'Failed to submit score');
  }
});

/**
 * POST /scores/bulk
 * Bulk score submission endpoint
 */
router.post('/scores/bulk', async (req, res) => {
  try {
    const { scores } = req.body;
    
    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Scores array is required and must not be empty'
      });
    }

    const db = getDB();
    const results = [];
    
    console.log(`🚀 Bulk score submission: ${scores.length} scores`);
    
    for (const scoreData of scores) {
      const { gameID, score, userID, username } = scoreData;
      
      if (!gameID || score === undefined || !userID || !username) {
        results.push({
          success: false,
          data: scoreData,
          error: 'Missing required fields'
        });
        continue;
      }
      
      try {
        const insertQuery = `
          INSERT INTO GameScores 
          (GameID, Ranking, Score, UserID, Username) 
          VALUES (:gameID, 0, :score, :userID, :username)
        `;
        
        const result = await db.query(insertQuery, { 
          params: { gameID, score, userID, username } 
        });
        
        const newRid = result[0]['@rid'];
        
        results.push({
          success: true,
          data: {
            rid: newRid,
            gameID,
            score,
            userID,
            username
          }
        });
        
        batchProcessor.addScoreSubmission(gameID);
        
      } catch (insertError) {
        results.push({
          success: false,
          data: scoreData,
          error: insertError.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log(`✅ Bulk submission completed: ${successCount} success, ${failCount} failed`);
    
    res.status(201).json({
      success: true,
      message: `Bulk submission completed: ${successCount}/${scores.length} successful`,
      summary: {
        total: scores.length,
        successful: successCount,
        failed: failCount
      },
      results: results
    });
    
  } catch (error) {
    console.error('Bulk score submission error:', error);
    handleError(res, error, 'Failed to submit bulk scores');
  }
});

/**
 * GET /batch-status
 * Get batch processing status
 */
router.get('/batch-status', (req, res) => {
  try {
    const status = batchProcessor.getStatus();
    
    res.json({
      success: true,
      data: {
        batchProcessor: status,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Failed to get batch status');
  }
});

/**
 * GET /scores/:gameID
 * Get leaderboard - NO PROVISIONAL CALCULATIONS!
 */
router.get('/scores/:gameID', async (req, res) => {
  try {
    const { gameID } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const db = getDB();
    
    console.log(`📋 Fetching leaderboard for game: ${gameID}`);
    
    // Just get the data as-is - NO CALCULATIONS!
    const query = `
      SELECT GameID, Ranking, Score, UserID, Username
      FROM GameScores 
      WHERE GameID = :gameID 
      ORDER BY Score DESC
      LIMIT :limit OFFSET :offset
    `;
    
    const scores = await db.query(query, { 
      params: { 
        gameID: gameID, 
        limit: parseInt(limit), 
        offset: parseInt(offset) 
      } 
    });
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM GameScores 
      WHERE GameID = :gameID
    `;
    
    const countResult = await db.query(countQuery, { 
      params: { gameID: gameID } 
    });
    const total = countResult[0]?.total || 0;
    
    // SIMPLEST POSSIBLE - just return what's in the database
    const processedScores = scores.map((score) => {
      return {
        ranking: score.Ranking, // NO CALCULATIONS - just the raw value
        score: score.Score,
        userID: score.UserID,
        username: score.Username,
        isRanked: score.Ranking > 0
      };
    });
    
    res.json({
      success: true,
      data: {
        gameID,
        scores: processedScores,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: total,
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Failed to fetch leaderboard');
  }
});

/**
 * GET /scores/top/:gameID
 * Get top scores - NO PROVISIONAL CALCULATIONS!
 */
router.get('/scores/top/:gameID', async (req, res) => {
  try {
    const { gameID } = req.params;
    const { limit = 10 } = req.query;
    
    const db = getDB();
    
    console.log(`🏆 Fetching top ${limit} scores for game: ${gameID}`);
    
    const query = `
      SELECT GameID, Ranking, Score, UserID, Username
      FROM GameScores 
      WHERE GameID = :gameID 
      ORDER BY Score DESC
      LIMIT :limit
    `;
    
    const topScores = await db.query(query, { 
      params: { 
        gameID: gameID, 
        limit: parseInt(limit) 
      } 
    });
    
    res.json({
      success: true,
      data: {
        gameID,
        limit: parseInt(limit),
        topScores: topScores.map((score) => ({
          ranking: score.Ranking, // NO CALCULATIONS - raw database value
          score: score.Score,
          userID: score.UserID,
          username: score.Username,
          isRanked: score.Ranking > 0
        }))
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Failed to fetch top scores');
  }
});

/**
 * GET /scores/user/:userID
 * Get user scores - NO PROVISIONAL CALCULATIONS!
 */
router.get('/scores/user/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const { gameID } = req.query;
    
    const db = getDB();
    
    console.log(`👤 Fetching user scores: ${userID}${gameID ? ` in game: ${gameID}` : ''}`);
    
    let query = `
      SELECT GameID, Ranking, Score, UserID, Username
      FROM GameScores 
      WHERE UserID = :userID
    `;
    
    const params = { userID: userID };
    
    if (gameID) {
      query += ' AND GameID = :gameID';
      params.gameID = gameID;
    }
    
    query += ' ORDER BY Score DESC';
    
    const scores = await db.query(query, { params: params });
    
    res.json({
      success: true,
      data: {
        userID,
        gameID: gameID || 'all',
        scores: scores.map(score => ({
          gameID: score.GameID,
          ranking: score.Ranking, // NO CALCULATIONS - raw value
          score: score.Score,
          username: score.Username,
          isRanked: score.Ranking > 0
        })),
        total: scores.length
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Failed to fetch user scores');
  }
});

/**
 * GET /scores/user/:userID/rank/:gameID
 * Get user rank - STILL HAS PROVISIONAL CALCULATION (this one might be OK)
 */
router.get('/scores/user/:userID/rank/:gameID', async (req, res) => {
  try {
    const { userID, gameID } = req.params;
    
    const db = getDB();
    
    console.log(`🎯 Fetching rank for user ${userID} in game ${gameID}`);
    
    const userScoreQuery = `
      SELECT Score, Ranking, Username
      FROM GameScores 
      WHERE UserID = :userID AND GameID = :gameID 
      ORDER BY Score DESC 
      LIMIT 1
    `;
    
    const userScoreResult = await db.query(userScoreQuery, { 
      params: { userID: userID, gameID: gameID } 
    });
    
    if (!userScoreResult || userScoreResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No scores found for this user in this game'
      });
    }
    
    const bestScore = userScoreResult[0].Score;
    const storedRanking = userScoreResult[0].Ranking;
    const username = userScoreResult[0].Username;
    
    // This endpoint can calculate rank if needed since it's for one specific user
    let actualRank = storedRanking;
    if (storedRanking === 0) {
      const rankQuery = `
        SELECT COUNT(*) + 1 as rank
        FROM GameScores 
        WHERE GameID = :gameID AND Score > :score
      `;
      
      const rankResult = await db.query(rankQuery, { 
        params: { gameID: gameID, score: bestScore } 
      });
      actualRank = rankResult[0]?.rank || 1;
    }
    
    const totalQuery = `
      SELECT COUNT(DISTINCT UserID) as total 
      FROM GameScores 
      WHERE GameID = :gameID
    `;
    
    const totalResult = await db.query(totalQuery, { 
      params: { gameID: gameID } 
    });
    const totalPlayers = totalResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        userID,
        username,
        gameID,
        bestScore,
        rank: actualRank,
        totalPlayers,
        percentile: totalPlayers > 0 ? ((totalPlayers - actualRank + 1) / totalPlayers * 100).toFixed(2) : 0,
        isRanked: storedRanking > 0
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Failed to fetch user rank');
  }
});

/**
 * POST /force-update-rankings/:gameID
 * Manual bulk ranking update
 */
router.post('/force-update-rankings/:gameID', async (req, res) => {
  try {
    const { gameID } = req.params;
    const db = getDB();
    
    console.log(`🔧 Force BULK ranking update for game: ${gameID}`);
    
    const result = await bulkRankingUpdate(db, gameID);
    
    res.json({
      success: true,
      message: 'BULK ranking update completed',
      gameID,
      result: {
        updatedRecords: result.updated,
        totalRecords: result.total,
        duration: result.duration + 'ms'
      }
    });
    
  } catch (error) {
    handleError(res, error, 'Failed to force update rankings');
  }
});

/**
 * DELETE /scores/:gameID/:userID
 * Delete user scores with batch update
 */
router.delete('/scores/:gameID/:userID', async (req, res) => {
  try {
    const { gameID, userID } = req.params;
    
    const db = getDB();
    
    console.log(`🗑️ Deleting scores for user ${userID} in game ${gameID}`);
    
    const deleteQuery = `
      DELETE FROM GameScores 
      WHERE GameID = :gameID AND UserID = :userID
    `;
    
    const result = await db.query(deleteQuery, { 
      params: { gameID: gameID, userID: userID } 
    });
    
    console.log(`✅ Deleted ${result.length} scores`);
    
    batchProcessor.addScoreSubmission(gameID);
    
    res.json({
      success: true,
      message: 'Scores deleted successfully',
      deletedCount: result.length
    });
    
  } catch (error) {
    handleError(res, error, 'Failed to delete scores');
  }
});



// Health check endpoint
router.get('/health', (req, res) => {
  const batchStatus = batchProcessor.getStatus();
  
  res.json({
    success: true,
    message: 'BULK Score API is running',
    timestamp: new Date().toISOString(),
    database: {
      database: DB_CONFIG.database,
      
    },
    batchProcessor: {
      pendingBatches: batchStatus.pendingBatches.length,
      processingGames: batchStatus.processingGames.length
    }
  });
});

// Test database connection endpoint
router.get('/test-db', async (req, res) => {
  try {
    const db = getDB();
    
    const result = await db.query('SELECT COUNT(*) as count FROM GameScores');
    
    const testQuery = `
      SELECT COUNT(*) as fouhouCount 
      FROM GameScores 
      WHERE GameID = :gameID
    `;
    
    const fouhouResult = await db.query(testQuery, { 
      params: { gameID: 'fouhou-v1' } 
    });
    
    res.json({
      success: true,
      message: 'Database connection successful',
      totalScores: result[0]?.count || 0,
      fouhouScores: fouhouResult[0]?.fouhouCount || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    handleError(res, error, 'Database connection failed');
  }
});

module.exports = router;