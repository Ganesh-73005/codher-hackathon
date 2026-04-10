#!/bin/bash

# CodHER Management System - Simple Deployment (2-day event)
# Quick deployment without SSL for AWS t3.medium

set -e

echo "=========================================="
echo "CodHER - Quick Deployment (HTTP Only)"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

echo -e "${GREEN}Step 1: Update system${NC}"
apt-get update

echo -e "${GREEN}Step 2: Install Docker${NC}"
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

echo -e "${GREEN}Step 3: Install Docker Compose${NC}"
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo -e "${GREEN}Step 4: Start Docker${NC}"
systemctl enable docker
systemctl start docker

echo -e "${GREEN}Step 5: Build and start containers${NC}"
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}Step 6: Setup firewall${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw --force enable

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Application running at: http://codher.in"
echo ""
echo "Commands:"
echo "  Status:  docker-compose -f docker-compose.prod.yml ps"
echo "  Logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop:    docker-compose -f docker-compose.prod.yml down"
echo "  Restart: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo -e "${YELLOW}GoDaddy DNS Setup:${NC}"
echo "1. Go to GoDaddy DNS Management"
echo "2. Add A Record:"
echo "   - Type: A"
echo "   - Name: @"
echo "   - Value: YOUR_AWS_IP"
echo "   - TTL: 600"
echo ""
