#!/bin/bash
echo "Stopping nginx container..."
sudo docker stop nginx 2>/dev/null || true
sudo docker rm nginx 2>/dev/null || true
echo "Pulling latest image..."
aws ecr get-login-password --region us-east-2 | sudo docker login --username AWS --password-stdin 665352994810.dkr.ecr.us-east-2.amazonaws.com
sudo docker pull 665352994810.dkr.ecr.us-east-2.amazonaws.com/ticketeate-nginx:latest
echo "Starting nginx without SSL..."
sudo docker run -d --name nginx --restart unless-stopped -p 80:80 -p 443:443 665352994810.dkr.ecr.us-east-2.amazonaws.com/ticketeate-nginx:latest
sleep 3
sudo docker ps | grep nginx
