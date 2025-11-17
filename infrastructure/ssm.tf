# AWS Systems Manager Parameter Store for Environment Variables

# Data source for current AWS account (defined in ec2.tf but referenced here)
# data "aws_caller_identity" "current" {}

# Data sources to read from Parameter Store
# These should be created manually or through a separate secure process

data "aws_ssm_parameter" "database_url" {
  name = "/ticketeate/${var.environment}/database-url"
}

data "aws_ssm_parameter" "better_auth_secret" {
  name = "/ticketeate/${var.environment}/better-auth-secret"
}

data "aws_ssm_parameter" "cloudinary_cloud_name" {
  name = "/ticketeate/${var.environment}/cloudinary-cloud-name"
}

data "aws_ssm_parameter" "cloudinary_api_key" {
  name = "/ticketeate/${var.environment}/cloudinary-api-key"
}

data "aws_ssm_parameter" "cloudinary_api_secret" {
  name = "/ticketeate/${var.environment}/cloudinary-api-secret"
}

data "aws_ssm_parameter" "google_client_id" {
  name = "/ticketeate/${var.environment}/google-client-id"
}

data "aws_ssm_parameter" "google_client_secret" {
  name = "/ticketeate/${var.environment}/google-client-secret"
}

data "aws_ssm_parameter" "resend_api_key" {
  name = "/ticketeate/${var.environment}/resend-api-key"
}

data "aws_ssm_parameter" "mercadopago_client_id" {
  name = "/ticketeate/${var.environment}/mercadopago-client-id"
}

data "aws_ssm_parameter" "mercadopago_client_secret" {
  name = "/ticketeate/${var.environment}/mercadopago-client-secret"
}

data "aws_ssm_parameter" "mp_platform_access_token" {
  name = "/ticketeate/${var.environment}/mp-platform-access-token"
}

data "aws_ssm_parameter" "service_auth_secret" {
  name = "/ticketeate/${var.environment}/service-auth-secret"
}

data "aws_ssm_parameter" "revalidation_secret" {
  name = "/ticketeate/${var.environment}/revalidation-secret"
}

data "aws_ssm_parameter" "resend_from_email" {
  name = "/ticketeate/${var.environment}/resend-from-email"
}

data "aws_ssm_parameter" "supabase_url" {
  name = "/ticketeate/${var.environment}/supabase-url"
}

data "aws_ssm_parameter" "supabase_anon_key" {
  name = "/ticketeate/${var.environment}/supabase-anon-key"
}

data "aws_ssm_parameter" "supabase_service_role_key" {
  name = "/ticketeate/${var.environment}/supabase-service-role-key"
}

data "aws_ssm_parameter" "google_maps_api_key" {
  name = "/ticketeate/${var.environment}/google-maps-api-key"
}

data "aws_ssm_parameter" "google_places_api_key" {
  name = "/ticketeate/${var.environment}/google-places-api-key"
}

# IAM Policy for Lambda to read SSM parameters
resource "aws_iam_role_policy" "lambda_ssm_policy" {
  name = "${var.project_name}-lambda-ssm-policy-${var.environment}"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/ticketeate/${var.environment}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Policy for EC2 to read SSM parameters
resource "aws_iam_role_policy" "ec2_ssm_policy" {
  name = "${var.project_name}-ec2-ssm-policy-${var.environment}"
  role = aws_iam_role.ec2_ecr_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/ticketeate/${var.environment}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = "*"
      }
    ]
  })
}

# Local values for common environment variables
locals {
  common_env_vars = {
    ENVIRONMENT                    = var.environment
    NODE_ENV                       = "production"
    
    # Database
    DATABASE_URL                   = data.aws_ssm_parameter.database_url.value
    DIRECT_URL                     = data.aws_ssm_parameter.database_url.value
    
    # Authentication
    BETTER_AUTH_SECRET             = data.aws_ssm_parameter.better_auth_secret.value
    BETTER_AUTH_URL                = "https://ticketeate.com.ar"
    FRONTEND_URL                   = "https://ticketeate.com.ar"
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME          = data.aws_ssm_parameter.cloudinary_cloud_name.value
    CLOUDINARY_API_KEY             = data.aws_ssm_parameter.cloudinary_api_key.value
    CLOUDINARY_API_SECRET          = data.aws_ssm_parameter.cloudinary_api_secret.value
    
    # Google OAuth
    GOOGLE_CLIENT_ID               = data.aws_ssm_parameter.google_client_id.value
    GOOGLE_CLIENT_SECRET           = data.aws_ssm_parameter.google_client_secret.value
    
    # Email
    RESEND_API_KEY                 = data.aws_ssm_parameter.resend_api_key.value
    RESEND_FROM_EMAIL              = data.aws_ssm_parameter.resend_from_email.value
    
    # Mercado Pago
    MERCADOPAGO_CLIENT_ID          = data.aws_ssm_parameter.mercadopago_client_id.value
    MERCADOPAGO_CLIENT_SECRET      = data.aws_ssm_parameter.mercadopago_client_secret.value
    MERCADOPAGO_REDIRECT_URI       = "https://ticketeate.com.ar/api/mercadopago/callback"
    MERCADO_PAGO_MOCK              = "false"
    MP_PLATFORM_ACCESS_TOKEN       = data.aws_ssm_parameter.mp_platform_access_token.value
    
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL       = data.aws_ssm_parameter.supabase_url.value
    NEXT_PUBLIC_SUPABASE_ANON_KEY  = data.aws_ssm_parameter.supabase_anon_key.value
    SUPABASE_ANON_KEY              = data.aws_ssm_parameter.supabase_anon_key.value
    SUPABASE_SERVICE_ROLE_KEY      = data.aws_ssm_parameter.supabase_service_role_key.value
    
    # Service-to-Service
    SERVICE_AUTH_SECRET            = data.aws_ssm_parameter.service_auth_secret.value
    REVALIDATION_SECRET            = data.aws_ssm_parameter.revalidation_secret.value
    
    # Redis
    REDIS_HOST                     = aws_instance.redis.private_ip
    REDIS_PORT                     = "6379"
    REDIS_URL                      = "redis://:ticketeate123@${aws_instance.redis.private_ip}:6379"
    REDIS_PASSWORD                 = "ticketeate123"
  }

  # Environment variables específicas para Next.js (públicas)
  nextjs_public_env_vars = {
    NEXT_PUBLIC_BETTER_AUTH_URL           = "https://ticketeate.com.ar"
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME     = data.aws_ssm_parameter.cloudinary_cloud_name.value
    NEXT_PUBLIC_EVENTS_SERVICE_URL        = "https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api/events"
    NEXT_PUBLIC_USERS_SERVICE_URL         = "https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api/users"
    NEXT_PUBLIC_USERS_API_URL             = "https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api/users"
    NEXT_PUBLIC_CHECKOUT_SERVICE_URL      = "https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api/checkout"
    NEXT_PUBLIC_PRODUCERS_SERVICE_URL     = "https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api/producers"
    NEXT_PUBLIC_FRONTEND_URL              = "https://ticketeate.com.ar"
    NEXT_PUBLIC_API_URL                   = "https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production/api"
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY       = data.aws_ssm_parameter.google_maps_api_key.value
    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY     = data.aws_ssm_parameter.google_places_api_key.value
    NEXT_PUBLIC_SUPABASE_URL              = data.aws_ssm_parameter.supabase_url.value
    NEXT_PUBLIC_SUPABASE_ANON_KEY         = data.aws_ssm_parameter.supabase_anon_key.value
  }
}
