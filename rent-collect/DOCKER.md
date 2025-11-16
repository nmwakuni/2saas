# Docker Deployment Guide for RentCollect

This guide explains how to run RentCollect using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git

## Quick Start

### 1. Clone and Setup Environment

```bash
# Navigate to the project directory
cd rent-collect

# Copy the Docker environment file
cp .env.docker.example .env.docker

# Edit the environment file with your actual credentials
nano .env.docker
```

### 2. Start the Application

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check service status
docker-compose ps
```

The application will be available at:
- **Application**: http://localhost:3000
- **Database**: PostgreSQL on localhost:5432

### 3. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

---

## Docker Services

The Docker Compose setup includes the following services:

### 1. **Database (PostgreSQL)**
- Image: `postgres:15-alpine`
- Port: `5432`
- Data persistence via Docker volume
- Health checks enabled

### 2. **Application (Next.js)**
- Built from local Dockerfile
- Port: `3000`
- Automatically runs database migrations on startup
- Depends on database service

### 3. **Prisma Studio** (Optional - Dev only)
- Database management UI
- Port: `5555`
- Start with: `docker-compose --profile dev up studio`

---

## Environment Variables

Required environment variables in `.env.docker`:

```bash
# Database
POSTGRES_USER=rentcollect
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=rentcollect

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Africa's Talking SMS
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=your_username

# M-Pesa Daraja API
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Useful Commands

### Building and Running

```bash
# Build without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up -d --build

# Start specific service
docker-compose up -d app
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow app logs
docker-compose logs -f app

# View database logs
docker-compose logs db

# Execute commands in running container
docker-compose exec app sh
docker-compose exec db psql -U rentcollect
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma Client
docker-compose exec app npx prisma generate

# Open Prisma Studio (dev mode)
docker-compose --profile dev up studio

# Backup database
docker-compose exec db pg_dump -U rentcollect rentcollect > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U rentcollect rentcollect
```

---

## Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml rentcollect

# Check services
docker service ls

# View logs
docker service logs rentcollect_app
```

### Using Kubernetes

Convert docker-compose.yml to Kubernetes manifests:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# Convert
kompose convert

# Deploy
kubectl apply -f .
```

---

## Performance Optimization

### 1. Multi-stage Build Optimization

The Dockerfile uses multi-stage builds:
- **deps**: Install dependencies
- **builder**: Build the application
- **runner**: Run the application (smallest image)

### 2. Layer Caching

To improve build times:
- Dependencies are installed first (cached layer)
- Source code is copied after dependencies
- Use `.dockerignore` to exclude unnecessary files

### 3. Health Checks

Health checks ensure the container is ready:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 3s
  retries: 3
```

---

## Troubleshooting

### Issue: Cannot connect to database

**Solution:**
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify DATABASE_URL in .env.docker
```

### Issue: Prisma migrations fail

**Solution:**
```bash
# Drop into app container
docker-compose exec app sh

# Manually run migrations
npx prisma migrate deploy

# Check database connection
npx prisma db pull
```

### Issue: Port already in use

**Solution:**
```bash
# Change ports in .env.docker
APP_PORT=3001
POSTGRES_PORT=5433

# Restart services
docker-compose down && docker-compose up -d
```

### Issue: Out of disk space

**Solution:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove all stopped containers
docker container prune
```

---

## Security Best Practices

1. **Use secrets for production**:
   ```bash
   # Create secrets
   echo "your_password" | docker secret create db_password -

   # Reference in docker-compose.yml
   secrets:
     - db_password
   ```

2. **Run as non-root user** (already configured in Dockerfile)

3. **Use read-only file system**:
   ```yaml
   services:
     app:
       read_only: true
       tmpfs:
         - /tmp
   ```

4. **Limit resources**:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 1G
   ```

---

## Monitoring

### Docker Stats

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats rentcollect-app
```

### Prometheus Metrics (Optional)

Add metrics endpoint to your app and configure Prometheus:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'rentcollect'
    static_configs:
      - targets: ['app:3000']
```

---

## Backup and Recovery

### Automated Backups

```bash
# Add to crontab
0 2 * * * docker-compose exec -T db pg_dump -U rentcollect rentcollect | gzip > /backups/rentcollect-$(date +\%Y\%m\%d).sql.gz
```

### Recovery

```bash
# Restore from backup
gunzip < backup.sql.gz | docker-compose exec -T db psql -U rentcollect rentcollect
```

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-repo/rentcollect/issues
- Documentation: See SETUP_GUIDE.md
- Docker Docs: https://docs.docker.com

---

## License

This project is licensed under the MIT License.
