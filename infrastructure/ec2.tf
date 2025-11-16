# EC2 Instances for Hybrid Architecture

# User Data script for Docker installation
locals {
  docker_install_script = <<-EOF
    #!/bin/bash
    set -e
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install Docker
    apt-get install -y \
      ca-certificates \
      curl \
      gnupg \
      lsb-release
    
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start Docker
    systemctl start docker
    systemctl enable docker
    
    # Add ubuntu user to docker group
    usermod -aG docker ubuntu
    
    # Install AWS CLI
    apt-get install -y awscli
    
    # Configure AWS ECR login (will need IAM role)
    aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com || true
    
    echo "Docker installation completed"
  EOF
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# IAM Role for EC2 instances (to pull from ECR)
resource "aws_iam_role" "ec2_ecr_role" {
  name = "${var.project_name}-ec2-ecr-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-ec2-ecr-role-${var.environment}"
      Environment = var.environment
    }
  )
}

# IAM Policy for ECR access
resource "aws_iam_role_policy" "ec2_ecr_policy" {
  name = "${var.project_name}-ec2-ecr-policy-${var.environment}"
  role = aws_iam_role.ec2_ecr_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach SSM Managed Instance Core policy for Systems Manager
resource "aws_iam_role_policy_attachment" "ec2_ssm_managed" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile-${var.environment}"
  role = aws_iam_role.ec2_ecr_role.name

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-ec2-profile-${var.environment}"
      Environment = var.environment
    }
  )
}

# EC2 Instance: Nginx (Edge Proxy)
resource "aws_instance" "nginx" {
  ami                    = var.ami_id
  instance_type          = var.nginx_instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.nginx.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = local.docker_install_script

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nginx-${var.environment}"
      Environment = var.environment
      Service     = "nginx"
      Role        = "edge-proxy"
    }
  )
}

# EC2 Instance: Next.js Frontend 1
resource "aws_instance" "nextjs_1" {
  ami                    = var.ami_id
  instance_type          = var.nextjs_instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.nextjs.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = local.docker_install_script

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nextjs-1-${var.environment}"
      Environment = var.environment
      Service     = "nextjs"
      Role        = "frontend"
      Instance    = "1"
    }
  )
}

# EC2 Instance: Next.js Frontend 2
resource "aws_instance" "nextjs_2" {
  ami                    = var.ami_id
  instance_type          = var.nextjs_instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public[1].id
  vpc_security_group_ids = [aws_security_group.nextjs.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = local.docker_install_script

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nextjs-2-${var.environment}"
      Environment = var.environment
      Service     = "nextjs"
      Role        = "frontend"
      Instance    = "2"
    }
  )
}

# EC2 Instance: Redis Cache
resource "aws_instance" "redis" {
  ami                    = var.ami_id
  instance_type          = var.redis_instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.redis.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = local.docker_install_script

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-redis-${var.environment}"
      Environment = var.environment
      Service     = "redis"
      Role        = "cache"
    }
  )
}

# Elastic IPs for Next.js instances
resource "aws_eip" "nextjs_1" {
  instance = aws_instance.nextjs_1.id
  domain   = "vpc"

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nextjs-1-eip-${var.environment}"
      Environment = var.environment
    }
  )
}

resource "aws_eip" "nextjs_2" {
  instance = aws_instance.nextjs_2.id
  domain   = "vpc"

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nextjs-2-eip-${var.environment}"
      Environment = var.environment
    }
  )
}

# Elastic IP for Nginx (optional but recommended)
resource "aws_eip" "nginx" {
  instance = aws_instance.nginx.id
  domain   = "vpc"

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nginx-eip-${var.environment}"
      Environment = var.environment
    }
  )
}
