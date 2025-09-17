# Deployment Guide

## Prerequisites

### System Requirements
- Node.js 14+ 
- npm 6+
- OrientDB 3.x server
- SSL certificates (production)

### OrientDB Setup
1. Install OrientDB server
2. Create database: `gamedb`
3. Create user: `admin`
4. Create schema:
```sql
CREATE CLASS GameScores
CREATE PROPERTY GameScores.GameID STRING
CREATE PROPERTY GameScores.UserID STRING  
CREATE PROPERTY GameScores.Username STRING
CREATE PROPERTY GameScores.Score INTEGER
CREATE PROPERTY GameScores.Ranking INTEGER
CREATE INDEX GameScores.GameID_UserID ON GameScores (GameID, UserID) UNIQUE
```

## Development Deployment

### Local Setup
```bash
# Clone repository
git clone https://github.com/StoyanovDenislav/Fouhou-backend.git
cd Fouhou-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start development server
npm run dev
```

### Docker Development
```bash
# Build image
docker build -t fouhou-backend .

# Run container
docker run -p 9000:9000 \
  -e NODE_ENV=development \
  -e DB_HOST=host.docker.internal \
  fouhou-backend
```

## Production Deployment

### Manual Deployment
```bash
# Set environment
export NODE_ENV=production
export PORT=9000
export DB_HOST=your-orientdb-host
export DB_PASSWORD=secure-password

# Install dependencies (production only)
npm ci --only=production

# Start server
npm start
```

### PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'fouhou-backend',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 9000,
      DB_HOST: 'your-orientdb-host',
      DB_PASSWORD: 'secure-password'
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js --env production

# Setup startup script
pm2 startup
pm2 save
```

### Docker Production
```dockerfile
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t fouhou-backend:production .
docker run -d -p 9000:9000 \
  --name fouhou-backend \
  -e NODE_ENV=production \
  -e DB_HOST=orientdb-server \
  -e DB_PASSWORD=secure-password \
  fouhou-backend:production
```

### Docker Compose
```yaml
version: '3.8'
services:
  fouhou-backend:
    build: .
    ports:
      - "9000:9000"
    environment:
      - NODE_ENV=production
      - DB_HOST=orientdb
      - DB_PASSWORD=secure-password
    depends_on:
      - orientdb
    restart: unless-stopped

  orientdb:
    image: orientdb:3.2
    environment:
      - ORIENTDB_ROOT_PASSWORD=secure-password
    ports:
      - "2424:2424"
      - "2480:2480"
    volumes:
      - orientdb_data:/orientdb/databases
    restart: unless-stopped

volumes:
  orientdb_data:
```

## SSL Configuration

### Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone \
  -d api.fouhou.stoyanography.com

# Set environment variables
export SSL_KEY_PATH=/etc/letsencrypt/live/api.fouhou.stoyanography.com/privkey.pem
export SSL_CERT_PATH=/etc/letsencrypt/live/api.fouhou.stoyanography.com/fullchain.pem
```

### Custom Certificate
```bash
# Create certs directory
mkdir -p ./certs

# Copy your certificates
cp your-privkey.pem ./certs/privkey.pem
cp your-fullchain.pem ./certs/fullchain.pem

# Set permissions
chmod 600 ./certs/*
```

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.fouhou.stoyanography.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.fouhou.stoyanography.com;

    ssl_certificate /etc/letsencrypt/live/api.fouhou.stoyanography.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fouhou.stoyanography.com/privkey.pem;

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

## Monitoring & Logs

### Application Logs
```bash
# PM2 logs
pm2 logs fouhou-backend

# Docker logs
docker logs fouhou-backend

# Follow logs
tail -f /var/log/fouhou-backend.log
```

### Health Monitoring
```bash
# Simple health check script
#!/bin/bash
curl -f http://localhost:9000/api/health || exit 1
```

### Performance Monitoring
Consider integrating:
- New Relic
- DataDog  
- Prometheus + Grafana

## Backup Strategy

### Database Backup
```bash
# OrientDB export
orientdb-console.sh "CONNECT REMOTE:localhost/gamedb admin password; EXPORT DATABASE backup.json"

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
orientdb-console.sh "CONNECT REMOTE:localhost/gamedb admin password; EXPORT DATABASE backup_$DATE.json"
```

### Application Backup
```bash
# Backup configuration
tar -czf backup_$(date +%Y%m%d).tar.gz \
  app.js api/ Database/ package.json .env
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple application instances
- Session-less design (already implemented)

### Database Scaling
- OrientDB clustering
- Read replicas
- Connection pooling

### Caching
- Redis for session data
- CDN for static assets
- Application-level caching

## Security Checklist

- [ ] Strong database passwords
- [ ] SSL certificates configured
- [ ] CORS origins restricted
- [ ] Input validation enabled
- [ ] Error messages sanitized
- [ ] Security headers (Helmet.js)
- [ ] Rate limiting configured
- [ ] Regular security updates

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change PORT in environment
2. **SSL certificate errors**: Verify paths and permissions
3. **Database connection**: Check OrientDB server status
4. **High memory usage**: Monitor batch processor

### Debug Mode
```bash
NODE_ENV=development DEBUG=* npm start
```