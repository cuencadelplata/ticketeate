# Terraform Configuration for TicketEate
# Provider: AWS
# Architecture: Hybrid (EC2 + Lambda)

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend para guardar el estado (opcional pero recomendado)
  # Descomenta cuando tengas el bucket S3 creado
  # backend "s3" {
  #   bucket         = "ticketeate-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-2"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "TicketEate"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Repository  = "github.com/cuencadelplata/ticketeate"
    }
  }
}
