# Security Groups for Hybrid Architecture

# Security Group for Nginx (Edge Proxy)
resource "aws_security_group" "nginx" {
  name        = "${var.project_name}-nginx-sg-${var.environment}"
  description = "Security group for Nginx reverse proxy"
  vpc_id      = aws_vpc.main.id

  # HTTP
  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH (opcional - solo desde IPs específicas)
  ingress {
    description = "SSH from specific IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nginx-sg-${var.environment}"
      Environment = var.environment
      Service     = "nginx"
    }
  )
}

# Security Group for Next.js Frontend
resource "aws_security_group" "nextjs" {
  name        = "${var.project_name}-nextjs-sg-${var.environment}"
  description = "Security group for Next.js frontend servers"
  vpc_id      = aws_vpc.main.id

  # Next.js port from Nginx
  ingress {
    description     = "Next.js port from Nginx"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.nginx.id]
  }

  # SSH (opcional)
  ingress {
    description = "SSH from specific IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-nextjs-sg-${var.environment}"
      Environment = var.environment
      Service     = "nextjs"
    }
  )
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg-${var.environment}"
  description = "Security group for Redis cache server"
  vpc_id      = aws_vpc.main.id

  # Redis port from Next.js
  ingress {
    description     = "Redis port from Next.js"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.nextjs.id]
  }

  # Redis port from Lambda (if in VPC)
  ingress {
    description     = "Redis port from Lambda"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  # SSH for tunneling
  ingress {
    description = "SSH from specific IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-redis-sg-${var.environment}"
      Environment = var.environment
      Service     = "redis"
    }
  )
}

# Security Group for Lambda Functions
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda-sg-${var.environment}"
  description = "Security group for Lambda functions"
  vpc_id      = aws_vpc.main.id

  # Allow all outbound traffic (Lambda needs to access external services)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-lambda-sg-${var.environment}"
      Environment = var.environment
      Service     = "lambda"
    }
  )
}
