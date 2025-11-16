# Docker Deployment Guide

This guide explains how to run Book It using Docker and Docker Compose.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Docker Commands](#docker-commands)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- `.env` file configured (see SETUP_GUIDE.md)

## Quick Start

### 1. Build and Start Services

```bash
docker-compose up -d
```

This command:
- Builds the Next.js application
- Starts PostgreSQL database
- Runs database migrations
- Starts the application on port 3000

### 2. Verify Services

```bash
docker-compose ps
```

You should see:
- `book-it-db` (PostgreSQL) - Running
- `book-it-app` (Next.js) - Running

### 3. View Logs

```bash
docker-compose logs -f
```

Or for specific service:

```bash
docker-compose logs -f app
docker-compose logs -f db
```

### 4. Access the Application

Open http://localhost:3000 in your browser.

## Configuration

### Environment Variables

Create a `.env` file in the root directory with all required variables:

```env
# See SETUP_GUIDE.md for complete list
DATABASE_URL=postgresql://postgres:postgres@db:5432/book_it
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
# ... (other variables)
```

**Important**: When running with Docker Compose, the database host should be `db` (service name), not `localhost`.

### Docker Compose Services

#### Database (PostgreSQL)

```yaml
services:
  db:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Features:**
- Persistent data with named volume
- Health checks for service dependencies
- Exposed on localhost:5432 for development access

#### Application (Next.js)

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    depends_on:
      db:
        condition: service_healthy
```

**Features:**
- Multi-stage build for optimized image size
- Runs as non-root user for security
- Automatic database migration on startup
- Hot reload not enabled (use `npm run dev` for development)

#### Prisma Studio (Optional)

```yaml
services:
  studio:
    # ...
    profiles:
      - tools
```

Start Prisma Studio for database management:

```bash
docker-compose --profile tools up studio
```

Access at http://localhost:5555

## Docker Commands

### Start Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d db
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Rebuild Application

After code changes:

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build app
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker-compose exec db psql -U postgres -d book_it

# Create backup
docker-compose exec db pg_dump -U postgres book_it > backup.sql

# Restore backup
docker-compose exec -T db psql -U postgres book_it < backup.sql
```

### Application Shell

```bash
# Access app container shell
docker-compose exec app sh

# Run Prisma commands
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma migrate dev
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service with last 100 lines
docker-compose logs -f --tail=100 app

# Since specific time
docker-compose logs --since 30m app
```

### Clean Up

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove everything (containers, images, volumes)
docker-compose down -v --rmi all
```

## Production Deployment

### 1. Build Production Image

```bash
docker build -t book-it:latest .
```

### 2. Production docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: book-it:latest
    restart: always
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production
      # ... other production env vars
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### 3. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Use External Database

For production, use managed PostgreSQL (Neon, Supabase, etc.):

```env
DATABASE_URL=postgresql://user:pass@external-db-host:5432/dbname
```

Update `docker-compose.prod.yml` to remove the `db` service.

### 5. Reverse Proxy (Nginx)

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Add Nginx to docker-compose:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
```

### 6. SSL with Let's Encrypt

```bash
# Using Certbot
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot certonly --webroot \
  -w /var/www/html \
  -d yourdomain.com
```

## Dockerfile Explained

### Multi-Stage Build

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
# Install only production dependencies

# Stage 2: Builder
FROM node:18-alpine AS builder
# Build the application

# Stage 3: Runner
FROM node:18-alpine AS runner
# Run the optimized build
```

**Benefits:**
- Smaller final image size (~150MB vs 1GB+)
- Faster deployments
- Better security (fewer packages)

### Security Features

- Runs as non-root user (`nextjs`)
- Minimal Alpine base image
- No development dependencies in final image
- Only necessary files copied

## Performance Optimization

### 1. Image Caching

Use `.dockerignore` to exclude unnecessary files:

```
node_modules
.next
.git
```

### 2. Build Cache

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t book-it .
```

### 3. Resource Limits

Set limits in docker-compose:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Troubleshooting

### Container Won't Start

Check logs:

```bash
docker-compose logs app
```

Common issues:
- Database not ready: Wait for health check
- Missing env vars: Check `.env` file
- Port conflict: Change port in docker-compose.yml

### Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Check connection from app container
docker-compose exec app sh
nc -zv db 5432
```

### Prisma Migration Issues

```bash
# Run migrations manually
docker-compose exec app npx prisma migrate deploy

# Reset database (WARNING: deletes data)
docker-compose exec app npx prisma migrate reset
```

### Out of Memory

Increase Docker memory limit:
- Docker Desktop: Settings → Resources → Memory
- Linux: Adjust Docker daemon config

### Slow Build Times

```bash
# Clean build cache
docker builder prune

# Use BuildKit
export DOCKER_BUILDKIT=1
docker-compose build
```

### Permission Issues

```bash
# Fix file ownership
sudo chown -R $(whoami):$(whoami) .
```

### Network Issues

```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

## Monitoring

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats book-it-app
```

### Health Checks

```bash
# Check app health
curl http://localhost:3000/api/health

# Database health
docker-compose exec db pg_isready -U postgres
```

## Development vs Production

### Development

Use npm directly for hot reload:

```bash
npm run dev
```

Use Docker only for database:

```bash
docker-compose up -d db
```

### Production

Always use Docker for consistency:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Best Practices

1. **Never commit `.env` file** - Use `.env.example` template
2. **Use named volumes** for persistent data
3. **Set resource limits** to prevent memory issues
4. **Use health checks** for service dependencies
5. **Regular backups** of database volume
6. **Monitor logs** for errors and warnings
7. **Update images** regularly for security patches

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Specification](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## Support

For Docker-specific issues:
1. Check logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Test database: `docker-compose exec db psql -U postgres`

Happy containerizing! 🐳
