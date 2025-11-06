# ⚙️ Environment Configuration

Complete guide to configuring your Fouhou Backend environment for development and production.

## 📁 Environment Files

### `.env` File Structure
Create a `.env` file in your project root directory:

```env
# ================================
# 🌐 SERVER CONFIGURATION
# ================================
NODE_ENV=development
PORT=9000
HOST=localhost

# ================================
# 🗄️ DATABASE CONFIGURATION  
# ================================
DB_HOST=localhost
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DB_NAME=gamedb
DB_USER=admin

# ================================
# 🔒 SSL/HTTPS CONFIGURATION
# ================================
SSL_KEY_PATH=./certs/privkey.pem
SSL_CERT_PATH=./certs/fullchain.pem

# ================================
# 🔧 BATCH PROCESSING SETTINGS
# ================================
BATCH_MAX_SIZE=10
BATCH_TIMEOUT_MS=2000
BATCH_COOLDOWN_MS=500
HIGH_LOAD_THRESHOLD=50

# ================================
# 📊 MONITORING & LOGGING
# ================================
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
HEALTH_CHECK_INTERVAL=30000
```

## 🏗️ Configuration Variables

### Server Configuration

#### `NODE_ENV`
- **Description**: Application environment mode
- **Values**: `development`, `production`, `testing`
- **Default**: `development`
- **Impact**: 
  - Controls error detail visibility
  - Enables/disables development features
  - Affects logging verbosity

```javascript
// Usage in code
const isDev = process.env.NODE_ENV !== "production";
```

#### `PORT`
- **Description**: Server listening port
- **Type**: Integer
- **Range**: 1024-65535
- **Default**: `9000`
- **Examples**: `3000`, `8080`, `9000`

#### `HOST`
- **Description**: Server binding hostname
- **Type**: String
- **Default**: `localhost`
- **Examples**: `0.0.0.0`, `localhost`, `api.yourdomain.com`

### Database Configuration

#### `DB_HOST`
- **Description**: OrientDB server hostname/IP
- **Type**: String
- **Default**: `localhost`
- **Examples**: `localhost`, `192.168.1.100`, `db.yourdomain.com`

#### `DB_PORT`
- **Description**: OrientDB server port
- **Type**: Integer
- **Default**: `2424`
- **Standard**: `2424` (binary protocol)

#### `DB_USERNAME`
- **Description**: OrientDB server username
- **Type**: String
- **Default**: `root`
- **Security**: Use strong credentials in production

#### `DB_PASSWORD`
- **Description**: OrientDB server password
- **Type**: String
- **Required**: Yes
- **Security**: Must be set, no default for security

#### `DB_NAME`
- **Description**: Target database name
- **Type**: String
- **Default**: `gamedb`
- **Pattern**: Alphanumeric, no spaces

#### `DB_USER`
- **Description**: Database user for operations
- **Type**: String
- **Default**: `admin`
- **Permissions**: Should have read/write access

### SSL/HTTPS Configuration

#### `SSL_KEY_PATH`
- **Description**: Path to SSL private key file
- **Type**: String (file path)
- **Required**: Production only
- **Example**: `./certs/privkey.pem`

#### `SSL_CERT_PATH`
- **Description**: Path to SSL certificate file
- **Type**: String (file path)
- **Required**: Production only
- **Example**: `./certs/fullchain.pem`

### Batch Processing Settings

#### `BATCH_MAX_SIZE`
- **Description**: Maximum scores per batch
- **Type**: Integer
- **Default**: `10`
- **Range**: 1-100
- **Impact**: Higher values = fewer database calls

#### `BATCH_TIMEOUT_MS`
- **Description**: Maximum batch wait time (milliseconds)
- **Type**: Integer
- **Default**: `2000`
- **Range**: 100-10000
- **Impact**: Lower values = faster updates

#### `BATCH_COOLDOWN_MS`
- **Description**: Cooldown between batch operations
- **Type**: Integer
- **Default**: `500`
- **Range**: 0-5000
- **Impact**: Prevents database overload

#### `HIGH_LOAD_THRESHOLD`
- **Description**: Threshold for high-load mode
- **Type**: Integer
- **Default**: `50`
- **Range**: 10-1000
- **Impact**: Switches to aggressive batching

## 🌍 Environment-Specific Configurations

### Development Environment

```env
# Development settings
NODE_ENV=development
PORT=9000
HOST=localhost

# Local database
DB_HOST=localhost
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=devpassword
DB_NAME=gamedb_dev
DB_USER=admin

# No SSL in development
# SSL_KEY_PATH=
# SSL_CERT_PATH=

# Relaxed batch settings for testing
BATCH_MAX_SIZE=5
BATCH_TIMEOUT_MS=1000
BATCH_COOLDOWN_MS=100

# Verbose logging
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

### Production Environment

```env
# Production settings
NODE_ENV=production
PORT=9000
HOST=0.0.0.0

# Production database
DB_HOST=db.yourdomain.com
DB_PORT=2424
DB_USERNAME=orient_user
DB_PASSWORD=super_secure_password_123!
DB_NAME=gamedb_prod
DB_USER=app_user

# SSL enabled
SSL_KEY_PATH=/etc/ssl/private/api.yourdomain.com.key
SSL_CERT_PATH=/etc/ssl/certs/api.yourdomain.com.crt

# Optimized batch settings
BATCH_MAX_SIZE=20
BATCH_TIMEOUT_MS=3000
BATCH_COOLDOWN_MS=1000
HIGH_LOAD_THRESHOLD=100

# Production logging
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false
HEALTH_CHECK_INTERVAL=60000
```

### Testing Environment

```env
# Testing settings
NODE_ENV=testing
PORT=9001
HOST=localhost

# Test database
DB_HOST=localhost
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=testpassword
DB_NAME=gamedb_test
DB_USER=test_user

# Fast batch processing for tests
BATCH_MAX_SIZE=2
BATCH_TIMEOUT_MS=100
BATCH_COOLDOWN_MS=50

# Minimal logging
LOG_LEVEL=error
ENABLE_REQUEST_LOGGING=false
```

## 🔧 Configuration Loading

### Environment Variable Loading Order

1. **System Environment Variables** (highest priority)
2. **`.env` file**
3. **Default values** (lowest priority)

```javascript
// Configuration loading in app
require('dotenv').config();

const config = {
  port: process.env.PORT || 9000,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development'
};
```

### Multiple Environment Files

```bash
# Project structure
├── .env                 # Default environment
├── .env.development     # Development overrides
├── .env.production      # Production overrides
├── .env.testing         # Testing overrides
└── .env.local           # Local overrides (git ignored)
```

Load specific environment file:
```bash
# Load production environment
NODE_ENV=production node app.js

# Load with custom env file
node -r dotenv/config app.js dotenv_config_path=.env.production
```

## 🔐 Security Best Practices

### Password Security

#### Strong Database Passwords
```env
# ❌ Weak passwords
DB_PASSWORD=password
DB_PASSWORD=123456
DB_PASSWORD=admin

# ✅ Strong passwords
DB_PASSWORD=Kj8#mN2$pQ9&vR4@
DB_PASSWORD=correct-horse-battery-staple-2024
DB_PASSWORD=MyApp_SecurePass_2024!
```

#### Environment Variable Security
```bash
# Protect .env file permissions
chmod 600 .env

# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### Production Security Checklist

- [ ] **Strong passwords** for all database credentials
- [ ] **SSL certificates** properly configured
- [ ] **Environment files** not committed to version control
- [ ] **File permissions** restricted on configuration files
- [ ] **Secrets management** system in use (AWS Secrets Manager, etc.)
- [ ] **Regular password rotation** scheduled
- [ ] **Access logging** enabled and monitored

## 🐳 Docker Environment Configuration

### Docker Compose Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  fouhou-backend:
    build: .
    ports:
      - "9000:9000"
    environment:
      - NODE_ENV=production
      - PORT=9000
      - DB_HOST=orientdb
      - DB_PASSWORD=${DB_PASSWORD}
      - SSL_KEY_PATH=/certs/privkey.pem
      - SSL_CERT_PATH=/certs/fullchain.pem
    env_file:
      - .env.production
    volumes:
      - ./certs:/certs:ro
```

### Docker Environment File

```env
# .env.docker
NODE_ENV=production
PORT=9000
HOST=0.0.0.0
DB_HOST=orientdb
DB_PORT=2424
DB_USERNAME=root
DB_PASSWORD=docker_secure_password
DB_NAME=gamedb
DB_USER=admin
```

## ☁️ Cloud Environment Configuration

### AWS Configuration

```bash
# Using AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name "/fouhou/production/db-password" \
  --value "your-secure-password" \
  --type "SecureString"

# Load in application
const password = await ssm.getParameter({
  Name: '/fouhou/production/db-password',
  WithDecryption: true
}).promise();
```

### Environment Variables in Cloud Services

#### Heroku
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set DB_PASSWORD=your-password
```

#### AWS ECS
```json
{
  "environment": [
    {"name": "NODE_ENV", "value": "production"},
    {"name": "PORT", "value": "9000"},
    {"name": "DB_HOST", "value": "your-db-host"}
  ]
}
```

#### Google Cloud Run
```bash
# Deploy with environment variables
gcloud run deploy fouhou-backend \
  --set-env-vars NODE_ENV=production,PORT=9000 \
  --set-env-vars DB_HOST=your-db-host
```

## 🔍 Configuration Validation

### Validation Script

```javascript
// scripts/validate-config.js
const requiredVars = [
  'DB_PASSWORD',
  'DB_HOST',
  'PORT'
];

const missingVars = requiredVars.filter(
  varName => !process.env[varName]
);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  process.exit(1);
}

console.log('✅ Configuration validation passed');
```

Run validation:
```bash
node scripts/validate-config.js
```

### Runtime Configuration Check

```javascript
// In app.js
const validateConfig = () => {
  const errors = [];
  
  if (!process.env.DB_PASSWORD) {
    errors.push('DB_PASSWORD is required');
  }
  
  if (process.env.NODE_ENV === 'production' && !process.env.SSL_CERT_PATH) {
    errors.push('SSL_CERT_PATH required in production');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
};

validateConfig();
```

## 📚 Related Documentation

- [Installation Guide](Installation.md) - Complete installation instructions
- [Getting Started](Getting-Started.md) - Quick start guide
- [Production Deployment](Production-Deployment.md) - Production deployment guide
- [SSL Configuration](SSL-Configuration.md) - SSL/HTTPS setup
- [Troubleshooting](Troubleshooting.md) - Common configuration issues

---

**⚙️ Configuration Status**: Complete | **🔒 Security**: Enforced | **🌍 Multi-Environment**: Supported