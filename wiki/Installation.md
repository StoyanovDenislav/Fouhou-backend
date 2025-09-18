# 🛠️ Installation Guide

Complete step-by-step installation guide for the Fouhou Backend on various environments.

## 📋 System Requirements

### Minimum Requirements
- **CPU**: 1 core, 1 GHz
- **RAM**: 512 MB
- **Storage**: 1 GB free space
- **OS**: Linux, macOS, Windows

### Recommended Requirements
- **CPU**: 2+ cores, 2.5+ GHz
- **RAM**: 2+ GB
- **Storage**: 10+ GB free space
- **OS**: Linux (Ubuntu 20.04+, CentOS 8+)

### Software Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (included with Node.js)
- **OrientDB**: Version 3.0 or higher
- **Git**: Latest version

## 🐧 Linux Installation

### Ubuntu/Debian

#### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Install OrientDB
```bash
# Download OrientDB
cd /opt
sudo wget https://repo1.maven.org/maven2/com/orientechnologies/orientdb-community/3.2.15/orientdb-community-3.2.15.tar.gz

# Extract
sudo tar -xzf orientdb-community-3.2.15.tar.gz
sudo mv orientdb-community-3.2.15 orientdb
sudo chown -R $USER:$USER orientdb

# Add to PATH
echo 'export ORIENTDB_HOME=/opt/orientdb' >> ~/.bashrc
echo 'export PATH=$PATH:$ORIENTDB_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

#### 4. Install Fouhou Backend
```bash
# Clone repository
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### CentOS/RHEL

#### 1. Update System
```bash
sudo yum update -y
```

#### 2. Install Node.js
```bash
# Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Install OrientDB
```bash
# Download and install Java (required for OrientDB)
sudo yum install -y java-11-openjdk

# Download OrientDB
cd /opt
sudo wget https://repo1.maven.org/maven2/com/orientechnologies/orientdb-community/3.2.15/orientdb-community-3.2.15.tar.gz
sudo tar -xzf orientdb-community-3.2.15.tar.gz
sudo mv orientdb-community-3.2.15 orientdb

# Set permissions
sudo chown -R $USER:$USER orientdb

# Configure environment
echo 'export ORIENTDB_HOME=/opt/orientdb' >> ~/.bashrc
echo 'export PATH=$PATH:$ORIENTDB_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

## 🍎 macOS Installation

### Using Homebrew (Recommended)

#### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js
```bash
brew install node
node --version
npm --version
```

#### 3. Install OrientDB
```bash
brew install orientdb
```

#### 4. Install Fouhou Backend
```bash
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend
npm install
```

### Manual Installation

#### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Run the installer
- Verify: `node --version` and `npm --version`

#### 2. Install OrientDB
```bash
# Download OrientDB
curl -O https://repo1.maven.org/maven2/com/orientechnologies/orientdb-community/3.2.15/orientdb-community-3.2.15.tar.gz

# Extract
tar -xzf orientdb-community-3.2.15.tar.gz
mv orientdb-community-3.2.15 /usr/local/orientdb

# Add to PATH
echo 'export ORIENTDB_HOME=/usr/local/orientdb' >> ~/.zshrc
echo 'export PATH=$PATH:$ORIENTDB_HOME/bin' >> ~/.zshrc
source ~/.zshrc
```

## 🪟 Windows Installation

### Using Windows Package Manager (winget)

#### 1. Install Node.js
```powershell
winget install OpenJS.NodeJS
```

#### 2. Install Git
```powershell
winget install Git.Git
```

#### 3. Manual OrientDB Installation
1. Download OrientDB from [orientdb.org](https://orientdb.org/download)
2. Extract to `C:\orientdb`
3. Add `C:\orientdb\bin` to system PATH
4. Install Java 11+ if not already installed

### Manual Installation

#### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Run the `.msi` installer
- Verify in Command Prompt: `node --version`

#### 2. Install Git
- Download from [git-scm.com](https://git-scm.com/)
- Run the installer with default options

#### 3. Install OrientDB
- Download ZIP from [orientdb.org](https://orientdb.org/download)
- Extract to `C:\orientdb`
- Add `C:\orientdb\bin` to system PATH

#### 4. Install Fouhou Backend
```cmd
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend
npm install
```

## 🐳 Docker Installation

### Quick Docker Setup

#### 1. Create Docker Compose File
```yaml
# docker-compose.yml
version: '3.8'

services:
  orientdb:
    image: orientdb:3.2.15
    ports:
      - "2424:2424"
      - "2480:2480"
    environment:
      - ORIENTDB_ROOT_PASSWORD=rootpassword
    volumes:
      - orientdb_data:/orientdb/databases

  fouhou-backend:
    build: .
    ports:
      - "9000:9000"
    environment:
      - NODE_ENV=production
      - DB_HOST=orientdb
      - DB_PASSWORD=rootpassword
    depends_on:
      - orientdb
    volumes:
      - ./:/app

volumes:
  orientdb_data:
```

#### 2. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 9000

CMD ["npm", "start"]
```

#### 3. Run with Docker Compose
```bash
docker-compose up -d
```

### Manual Docker Setup

#### 1. Run OrientDB Container
```bash
docker run -d --name orientdb \
  -p 2424:2424 -p 2480:2480 \
  -e ORIENTDB_ROOT_PASSWORD=rootpassword \
  orientdb:3.2.15
```

#### 2. Build and Run Fouhou Backend
```bash
# Build image
docker build -t fouhou-backend .

# Run container
docker run -d --name fouhou-api \
  -p 9000:9000 \
  --link orientdb:orientdb \
  -e DB_HOST=orientdb \
  -e DB_PASSWORD=rootpassword \
  fouhou-backend
```

## ☁️ Cloud Installation

### AWS EC2

#### 1. Launch EC2 Instance
- **AMI**: Amazon Linux 2
- **Instance Type**: t3.micro (free tier) or larger
- **Security Group**: Allow ports 22, 80, 443, 9000

#### 2. Connect and Install
```bash
# Connect to instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Clone and setup
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend
npm install
```

### Google Cloud Platform

#### 1. Create VM Instance
```bash
# Using gcloud CLI
gcloud compute instances create fouhou-backend \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-micro \
  --zone=us-central1-a
```

#### 2. Connect and Install
```bash
# Connect
gcloud compute ssh fouhou-backend

# Install dependencies
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Setup application
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend
npm install
```

### Digital Ocean

#### 1. Create Droplet
- **Image**: Ubuntu 20.04 LTS
- **Size**: Basic ($5/month minimum)
- **Region**: Choose closest to users

#### 2. Initial Setup
```bash
# Connect via SSH
ssh root@your-droplet-ip

# Create non-root user
adduser fouhou
usermod -aG sudo fouhou
su - fouhou

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Setup application
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend
npm install
```

## 🔧 Post-Installation Setup

### 1. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit configuration
nano .env
```

### 2. Initialize Database
```bash
# Start OrientDB server
$ORIENTDB_HOME/bin/server.sh

# In another terminal, create database
$ORIENTDB_HOME/bin/console.sh
> CREATE DATABASE gamedb plocal admin admin
```

### 3. Test Installation
```bash
# Start application
npm run dev

# Test health endpoint
curl http://localhost:9000/api/health
```

## 🚀 Production Setup

### 1. Install Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start app.js --name fouhou-backend

# Configure auto-restart
pm2 startup
pm2 save
```

### 2. Configure Reverse Proxy (Nginx)
```nginx
# /etc/nginx/sites-available/fouhou-backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Setup SSL with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com
```

## 🔍 Verification

### Check Installation
```bash
# Verify Node.js
node --version
# Expected: v18.x.x or higher

# Verify npm
npm --version
# Expected: 8.x.x or higher

# Verify OrientDB
orientdb --version
# Expected: OrientDB 3.x.x

# Check application
npm test
# Should show: Error: no test specified (expected)

# Start application
npm run dev
# Should start without errors
```

### Health Check
```bash
# API health
curl http://localhost:9000/api/health

# Database test
curl http://localhost:9000/api/test-db

# Submit test score
curl -X POST http://localhost:9000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"gameID":"test","score":100,"userID":"test","username":"Test"}'
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 9000
sudo lsof -i :9000

# Kill process
sudo kill -9 <PID>
```

#### OrientDB Connection Failed
```bash
# Check OrientDB status
ps aux | grep orientdb

# Restart OrientDB
$ORIENTDB_HOME/bin/shutdown.sh
$ORIENTDB_HOME/bin/server.sh
```

#### Permission Denied
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules
```

## 📚 Next Steps

After successful installation:

1. **[Environment Configuration](Environment-Configuration.md)** - Configure your environment
2. **[Getting Started](Getting-Started.md)** - Basic usage guide
3. **[API Overview](API-Overview.md)** - Learn the API endpoints
4. **[Production Deployment](Production-Deployment.md)** - Deploy to production

---

**✅ Installation Complete!** Your Fouhou Backend is ready to use.