# Lambda Functions Configuration

# IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-lambda-exec-role-${var.environment}"
      Environment = var.environment
    }
  )
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach VPC execution policy (if Lambda needs VPC access)
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda function: svc-users
resource "aws_lambda_function" "svc_users" {
  function_name = "${var.project_name}-svc-users-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.services["ticketeate-svc-users"].repository_url}:latest"
  
  memory_size = var.lambda_memory["users"]
  timeout     = var.lambda_timeout["users"]

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      ENVIRONMENT = var.environment
      REDIS_HOST  = aws_instance.redis.private_ip
      REDIS_PORT  = "6379"
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-svc-users-${var.environment}"
      Environment = var.environment
      Service     = "svc-users"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc
  ]
}

# Lambda function: svc-events
resource "aws_lambda_function" "svc_events" {
  function_name = "${var.project_name}-svc-events-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.services["ticketeate-svc-events"].repository_url}:latest"
  
  memory_size = var.lambda_memory["events"]
  timeout     = var.lambda_timeout["events"]

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      ENVIRONMENT = var.environment
      REDIS_HOST  = aws_instance.redis.private_ip
      REDIS_PORT  = "6379"
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-svc-events-${var.environment}"
      Environment = var.environment
      Service     = "svc-events"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc
  ]
}

# Lambda function: svc-producers
resource "aws_lambda_function" "svc_producers" {
  function_name = "${var.project_name}-svc-producers-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.services["ticketeate-svc-producers"].repository_url}:latest"
  
  memory_size = var.lambda_memory["producers"]
  timeout     = var.lambda_timeout["producers"]

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      ENVIRONMENT = var.environment
      REDIS_HOST  = aws_instance.redis.private_ip
      REDIS_PORT  = "6379"
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-svc-producers-${var.environment}"
      Environment = var.environment
      Service     = "svc-producers"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc
  ]
}

# Lambda function: svc-checkout
resource "aws_lambda_function" "svc_checkout" {
  function_name = "${var.project_name}-svc-checkout-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.services["ticketeate-svc-checkout"].repository_url}:latest"
  
  memory_size = var.lambda_memory["checkout"]
  timeout     = var.lambda_timeout["checkout"]

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      ENVIRONMENT = var.environment
      REDIS_HOST  = aws_instance.redis.private_ip
      REDIS_PORT  = "6379"
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-svc-checkout-${var.environment}"
      Environment = var.environment
      Service     = "svc-checkout"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc
  ]
}

# CloudWatch Log Groups for Lambda functions
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = {
    svc-users     = aws_lambda_function.svc_users.function_name
    svc-events    = aws_lambda_function.svc_events.function_name
    svc-producers = aws_lambda_function.svc_producers.function_name
    svc-checkout  = aws_lambda_function.svc_checkout.function_name
  }

  name              = "/aws/lambda/${each.value}"
  retention_in_days = 7

  tags = merge(
    var.common_tags,
    {
      Name        = "${each.key}-logs"
      Environment = var.environment
      Service     = each.key
    }
  )
}
