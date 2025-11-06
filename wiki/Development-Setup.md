# 🔧 Development Setup

Complete guide for setting up a local development environment for the Fouhou Backend.

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.0+ | Runtime environment |
| **npm** | 8.0+ | Package manager |
| **OrientDB** | 3.0+ | Database server |
| **Git** | Latest | Version control |
| **VS Code** | Latest | Recommended IDE |

### Recommended Tools

| Tool | Purpose | Alternative |
|------|---------|-------------|
| **Postman** | API testing | curl, Insomnia |
| **OrientDB Studio** | Database management | Command line |
| **nodemon** | Auto-restart | pm2 |
| **Docker** | Containerization | Native install |

## 🚀 Quick Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend

# Install dependencies
npm install

# Install development dependencies (if not included)
npm install --save-dev nodemon
```

### 2. Configure Environment

```bash
# Create development environment file
cat > .env << 'EOF'
# Development Configuration
NODE_ENV=development
PORT=9000
HOST=localhost

# Local Database
DB_HOST=localhost
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=devpassword
DB_NAME=gamedb_dev
DB_USER=admin

# Development Batch Settings
BATCH_MAX_SIZE=5
BATCH_TIMEOUT_MS=1000
BATCH_COOLDOWN_MS=100
HIGH_LOAD_THRESHOLD=20

# Debug Settings
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
BATCH_DEBUG=true
EOF
```

### 3. Setup Database

```bash
# Start OrientDB (if installed locally)
$ORIENTDB_HOME/bin/server.sh

# Or using Docker
docker run -d --name orientdb-dev \
  -p 2424:2424 -p 2480:2480 \
  -e ORIENTDB_ROOT_PASSWORD=devpassword \
  orientdb:3.2.15
```

### 4. Initialize Database Schema

```bash
# Connect to OrientDB console
$ORIENTDB_HOME/bin/console.sh

# Create development database
> CONNECT REMOTE:localhost root devpassword
> CREATE DATABASE gamedb_dev plocal admin admin
> CONNECT gamedb_dev admin admin

# Create schema (copy from Database Schema docs)
> CREATE CLASS GameScores EXTENDS V
> CREATE PROPERTY GameScores.GameID STRING
> CREATE PROPERTY GameScores.UserID STRING
> CREATE PROPERTY GameScores.Username STRING
> CREATE PROPERTY GameScores.Score DOUBLE
> CREATE PROPERTY GameScores.Ranking INTEGER
> CREATE PROPERTY GameScores.Timestamp DATETIME

# Create indexes
> CREATE INDEX GameScores.GameID_Score ON GameScores (GameID, Score) NOTUNIQUE
> CREATE INDEX GameScores.UserID ON GameScores (UserID) NOTUNIQUE
> CREATE INDEX GameScores.GameID_UserID ON GameScores (GameID, UserID) UNIQUE

> QUIT
```

### 5. Start Development Server

```bash
# Start with auto-restart
npm run dev

# Or manually
node app.js
```

## 🛠️ Development Workflow

### Project Structure

```
Fouhou-backend/
├── 📁 api/                 # API route handlers
│   └── scoreAPI.js         # Score management endpoints
├── 📁 Database/            # Database utilities
│   └── databaseClass.js    # OrientDB connection class
├── 📁 wiki/               # Documentation (you're here!)
├── 📄 app.js              # Main application entry point
├── 📄 package.json        # Project dependencies
├── 📄 .env                # Environment configuration
├── 📄 .gitignore          # Git ignore rules
└── 📄 README.md           # Project overview
```

### Development Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon app.js",
    "start": "cross-env NODE_ENV=production node app.js",
    "test": "node test/run-tests.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "db:setup": "node scripts/setup-db.js",
    "db:seed": "node scripts/seed-data.js",
    "db:reset": "node scripts/reset-db.js"
  }
}
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-endpoint

# Make changes and commit
git add .
git commit -m "Add new endpoint for user statistics"

# Push and create PR
git push origin feature/new-endpoint
```

## 🧪 Testing Setup

### Manual Testing

Create a test script for quick API testing:

```bash
# test/api-test.sh
#!/bin/bash

BASE_URL="http://localhost:9000"

echo "🧪 Testing Fouhou Backend API"

# Health check
echo "📊 Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq .

# Submit test score
echo "🎯 Submitting test score..."
curl -X POST "$BASE_URL/api/scores" \
  -H "Content-Type: application/json" \
  -d '{
    "gameID": "test-game",
    "score": 1500,
    "userID": "test-user",
    "username": "TestPlayer"
  }' | jq .

# Get leaderboard
echo "📋 Getting leaderboard..."
curl -s "$BASE_URL/api/scores/test-game?limit=5" | jq .

echo "✅ API tests completed!"
```

Make it executable and run:
```bash
chmod +x test/api-test.sh
./test/api-test.sh
```

### Database Testing

Create database test utilities:

```javascript
// test/db-test.js
const Database = require('../Database/databaseClass');

const DB_CONFIG = {
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'devpassword',
  database: 'gamedb_dev',
  dbUser: 'admin',
  dbPassword: 'admin'
};

async function testDatabase() {
  console.log('🗄️ Testing database connection...');
  
  try {
    const dbInstance = new Database(
      DB_CONFIG.host,
      DB_CONFIG.port,
      DB_CONFIG.username,
      DB_CONFIG.password
    );
    
    const db = dbInstance.useDatabase(
      DB_CONFIG.database,
      DB_CONFIG.dbUser,
      DB_CONFIG.dbPassword
    );
    
    // Test query
    const result = await db.query('SELECT COUNT(*) as count FROM GameScores');
    console.log('✅ Database connection successful');
    console.log('📊 Total scores:', result[0]?.count || 0);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabase();
```

Run database test:
```bash
node test/db-test.js
```

## 🐛 Debugging Setup

### Debug Configuration

Add debug configuration to your environment:

```env
# Debug settings
DEBUG=fouhou:*
LOG_LEVEL=debug
BATCH_DEBUG=true
REQUEST_DEBUG=true
```

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Fouhou Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/app.js",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "fouhou:*"
      },
      "envFile": "${workspaceFolder}/.env",
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Console Debugging

Add debug logging throughout your code:

```javascript
// Enhanced logging
const debug = require('debug')('fouhou:api');

// In your route handlers
router.post('/scores', async (req, res) => {
  debug('Score submission received:', req.body);
  
  try {
    // Process score...
    debug('Score processed successfully');
  } catch (error) {
    debug('Score processing failed:', error);
  }
});
```

## 📊 Development Monitoring

### Request Logging

Enhanced request logging for development:

```javascript
// In app.js - replace basic logging with detailed version
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Request:', JSON.stringify(logData, null, 2));
    }
  });
  
  next();
});
```

### Performance Monitoring

Add performance monitoring for development:

```javascript
// Performance middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to ms
    
    if (duration > 100) { // Log slow requests
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
});
```

## 🔧 Development Tools Setup

### ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console in development
    'no-unused-vars': 'warn',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
  },
};
```

### Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Git Hooks

Setup pre-commit hooks with Husky:

```bash
# Install Husky
npm install --save-dev husky

# Initialize
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run format"
```

## 🚀 Development Environment Scripts

### Database Setup Script

Create `scripts/setup-db.js`:

```javascript
const Database = require('../Database/databaseClass');

async function setupDatabase() {
  console.log('🗄️ Setting up development database...');
  
  try {
    // Database setup logic here
    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
```

### Seed Data Script

Create `scripts/seed-data.js`:

```javascript
const Database = require('../Database/databaseClass');

const sampleData = [
  {
    gameID: 'fouhou-v1',
    userID: 'player1',
    username: 'Alice',
    score: 2500
  },
  {
    gameID: 'fouhou-v1',
    userID: 'player2',
    username: 'Bob',
    score: 1800
  },
  // More sample data...
];

async function seedData() {
  console.log('🌱 Seeding development data...');
  
  try {
    // Seed logic here
    console.log('✅ Data seeding completed');
  } catch (error) {
    console.error('❌ Data seeding failed:', error);
  }
}

seedData();
```

### Reset Database Script

Create `scripts/reset-db.js`:

```javascript
async function resetDatabase() {
  console.log('🔄 Resetting development database...');
  
  try {
    // Reset logic here
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
  }
}

resetDatabase();
```

## 📱 API Development Tools

### Postman Collection

Create a Postman collection for API testing:

```json
{
  "info": {
    "name": "Fouhou Backend API",
    "description": "Development API collection"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/health",
          "host": ["{{baseUrl}}"],
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Submit Score",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"gameID\": \"fouhou-v1\",\n  \"score\": 1500,\n  \"userID\": \"user123\",\n  \"username\": \"TestPlayer\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/scores",
          "host": ["{{baseUrl}}"],
          "path": ["api", "scores"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:9000"
    }
  ]
}
```

## 📚 Related Documentation

- [Getting Started](Getting-Started.md) - Quick start guide
- [Environment Configuration](Environment-Configuration.md) - Configuration details
- [API Overview](API-Overview.md) - API documentation
- [Contributing](Contributing.md) - Contribution guidelines

---

**🔧 Development Status**: Ready | **🧪 Testing**: Enabled | **🐛 Debugging**: Configured