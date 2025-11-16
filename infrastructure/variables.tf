# Variables for TicketEate Infrastructure

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ticketeate"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-2a", "us-east-2b"]
}

# EC2 Configuration
variable "nginx_instance_type" {
  description = "Instance type for Nginx"
  type        = string
  default     = "t3.micro"
}

variable "nextjs_instance_type" {
  description = "Instance type for Next.js"
  type        = string
  default     = "m7i-flex.large"
}

variable "redis_instance_type" {
  description = "Instance type for Redis"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for EC2 instances (Ubuntu 22.04)"
  type        = string
  # Ubuntu 22.04 LTS en us-east-2
  default     = "ami-0862be96e41dcbf74"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  # Cambia esto por tu key pair existente
  default     = "ticketeate-key"
}

variable "my_ip" {
  description = "Your IP address for SSH access (CIDR format)"
  type        = string
  # Cambia esto por tu IP pública
  default     = "0.0.0.0/0"  # ⚠️ CAMBIAR POR TU IP/32
}

# Domain
variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "ticketeate.page"
}

# Lambda Configuration
variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs22.x"
}

variable "lambda_memory" {
  description = "Lambda memory in MB"
  type        = map(number)
  default = {
    users     = 512
    events    = 512
    producers = 512
    checkout  = 1024
  }
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = map(number)
  default = {
    users     = 30
    events    = 30
    producers = 30
    checkout  = 60
  }
}

# ECR
variable "ecr_repositories" {
  description = "List of ECR repositories to create"
  type        = list(string)
  default = [
    "ticketeate-nginx",
    "ticketeate-next",
    "ticketeate-redis",
    "ticketeate-svc-users",
    "ticketeate-svc-events",
    "ticketeate-svc-producers",
    "ticketeate-svc-checkout"
  ]
}

# Tags
variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project   = "TicketEate"
    ManagedBy = "Terraform"
  }
}
