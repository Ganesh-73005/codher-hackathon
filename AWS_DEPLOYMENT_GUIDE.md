# CodHER Management System - AWS Deployment Guide

## Prerequisites
- AWS Account
- GoDaddy domain: codher.in
- SSH client

## Step 1: Launch AWS EC2 Instance

### Instance Configuration:
1. **Instance Type**: t3.medium
   - 2 vCPUs
   - 4 GB RAM
   - Suitable for 300 concurrent users

2. **AMI**: Ubuntu Server 22.04 LTS

3. **Storage**: 30 GB SSD (gp3)

4. **Security Group Rules**:
   ```
   SSH (22)     - Your IP only
   HTTP (80)    - 0.0.0.0/0
   HTTPS (443)  - 0.0.0.0/0
   ```

5. **Key Pair**: Create/use existing SSH key pair

6. **Elastic IP**: Attach an Elastic IP to your instance

## Step 2: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
```

## Step 3: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-repo/codher-management.git
cd codher-management
```

## Step 4: Configure Environment Variables

```bash
# Copy and edit production environment
cp .env.production.example .env.production
nano .env.production
```

Update the following:
- `MONGO_ROOT_PASSWORD`: Strong password for MongoDB
- `JWT_SECRET`: Random 32+ character string
- `SMTP_USER`: Your email for sending credentials
- `SMTP_PASSWORD`: App-specific password
- `SMTP_FROM`: noreply@codher.in
- `SSL_EMAIL`: admin@codher.in

## Step 5: Run Deployment Script

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

This will:
- Install Docker and Docker Compose
- Setup SSL certificates with Let's Encrypt
- Build and start all containers
- Configure firewall
- Setup automated backups

## Step 6: Configure GoDaddy DNS

1. Go to [GoDaddy DNS Management](https://dcc.godaddy.com/manage/codher.in/dns)

2. **Add A Record for root domain**:
   - Type: `A`
   - Name: `@`
   - Value: `YOUR_ELASTIC_IP`
   - TTL: `600 seconds`

3. **Add A Record for www**:
   - Type: `A`
   - Name: `www`
   - Value: `YOUR_ELASTIC_IP`
   - TTL: `600 seconds`

4. Wait 10-30 minutes for DNS propagation

## Step 7: Verify Deployment

### Check Container Status:
```bash
docker-compose -f docker-compose.prod.yml ps
```

All containers should show "Up" status.

### View Logs:
```bash
# All containers
docker-compose -f docker-compose.prod.yml logs -f

# Specific container
docker logs -f codher-backend
docker logs -f codher-frontend
docker logs -f codher-mongodb
```

### Test Application:
1. Open browser: `https://codher.in`
2. Login with admin credentials
3. Test all features

## Step 8: SSL Certificate Renewal

Certificates auto-renew via certbot container. To manually renew:

```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart frontend
```

## Monitoring and Maintenance

### View Resource Usage:
```bash
docker stats
```

### Backup Database:
```bash
/usr/local/bin/backup-codher.sh
```

Backups stored in `/backup/codher/`

### Update Application:
```bash
cd /home/ubuntu/codher-management
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Restart Services:
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

## Performance Optimization

### For 300 Concurrent Users:

**Backend Workers**: 4 (configured in Dockerfile)
**MongoDB**: Default settings suitable for t3.medium
**Nginx**: Configured with rate limiting (10 req/s per IP)

### Monitor Performance:
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Network traffic
iftop
```

## Troubleshooting

### Container Won't Start:
```bash
docker-compose -f docker-compose.prod.yml logs [container-name]
```

### SSL Certificate Issues:
```bash
# Check certificate
docker exec codher-frontend ls -la /etc/nginx/ssl/

# Reissue certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --force-renew -d codher.in -d www.codher.in
```

### Database Connection Issues:
```bash
# Enter MongoDB container
docker exec -it codher-mongodb mongosh -u admin -p

# Check connections
use codher_db
db.stats()
```

### High Memory Usage:
```bash
# Check what's using memory
docker stats

# Restart containers
docker-compose -f docker-compose.prod.yml restart
```

## Security Checklist

- [x] SSH key-based authentication only
- [x] Firewall configured (UFW)
- [x] SSL/TLS enabled
- [x] MongoDB authentication enabled
- [x] Environment variables secured
- [x] Rate limiting configured
- [x] Security headers enabled
- [x] Non-root users in containers

## Scaling for More Users

If you need to handle > 500 users:

1. **Upgrade Instance**: t3.large (4 vCPU, 8 GB RAM)
2. **Increase Backend Workers**: Edit Dockerfile, change `--workers 4` to `--workers 8`
3. **Add Redis**: For session management
4. **Database Optimization**: Add indexes, connection pooling

## Cost Estimation

### AWS Costs (Monthly):
- t3.medium instance: ~$30
- 30 GB SSD storage: ~$3
- Data transfer (100 GB): ~$9
- Elastic IP: Free (if attached)
**Total: ~$42/month**

### Additional Costs:
- Domain renewal (GoDaddy): ~$15/year
- Email service (if using SendGrid/etc): Varies

## Support

For issues:
1. Check logs first
2. Review troubleshooting section
3. Contact system administrator

---

**Deployment Date**: [Add date here]
**Version**: 1.0
**Last Updated**: [Add date here]
