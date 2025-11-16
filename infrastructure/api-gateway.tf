# API Gateway HTTP API for Lambda Functions

# HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"
  description   = "HTTP API Gateway for ${var.project_name} Lambda functions"

  cors_configuration {
    allow_origins = [
      "https://${var.domain_name}",
      "https://www.${var.domain_name}",
      "http://localhost:3000"
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    allow_headers = [
      "authorization",
      "content-type",
      "x-requested-with",
      "cookie",
      "accept",
      "origin",
      "cache-control",
      "x-api-key"
    ]
    expose_headers = ["content-type", "x-total-count"]
    allow_credentials = true
    max_age       = 300
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-api-${var.environment}"
      Environment = var.environment
    }
  )
}

# Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-api-stage-${var.environment}"
      Environment = var.environment
    }
  )
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-api-logs-${var.environment}"
      Environment = var.environment
    }
  )
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  for_each = {
    svc-users     = aws_lambda_function.svc_users.function_name
    svc-events    = aws_lambda_function.svc_events.function_name
    svc-producers = aws_lambda_function.svc_producers.function_name
    svc-checkout  = aws_lambda_function.svc_checkout.function_name
  }

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = each.value
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Integrations
resource "aws_apigatewayv2_integration" "svc_users" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.svc_users.invoke_arn
  
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_integration" "svc_events" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.svc_events.invoke_arn
  
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_integration" "svc_producers" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.svc_producers.invoke_arn
  
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_integration" "svc_checkout" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.svc_checkout.invoke_arn
  
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

# Routes for svc-users
# Route for exact /api/users path (without trailing segments)
resource "aws_apigatewayv2_route" "svc_users_root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/users"
  target    = "integrations/${aws_apigatewayv2_integration.svc_users.id}"
}

# Route for /api/users/* paths
resource "aws_apigatewayv2_route" "svc_users" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/users/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_users.id}"
}

# Route for exact /api/wallet path
resource "aws_apigatewayv2_route" "svc_wallet_root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/wallet"
  target    = "integrations/${aws_apigatewayv2_integration.svc_users.id}"
}

# Route for /api/wallet/* paths
resource "aws_apigatewayv2_route" "svc_wallet" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/wallet/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_users.id}"
}

# Routes for svc-events
# Route for exact /api/events path (without trailing segments)
resource "aws_apigatewayv2_route" "svc_events_root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/events"
  target    = "integrations/${aws_apigatewayv2_integration.svc_events.id}"
}

# Route for /api/events/* paths
resource "aws_apigatewayv2_route" "svc_events" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/events/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_events.id}"
}

# Routes for svc-producers
# Route for exact /api/producers path (without trailing segments)
resource "aws_apigatewayv2_route" "svc_producers_root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/producers"
  target    = "integrations/${aws_apigatewayv2_integration.svc_producers.id}"
}

# Route for /api/producers/* paths
resource "aws_apigatewayv2_route" "svc_producers" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/producers/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_producers.id}"
}

# Routes for svc-checkout
# Route for exact /api/checkout path (without trailing segments)
resource "aws_apigatewayv2_route" "svc_checkout_root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/checkout"
  target    = "integrations/${aws_apigatewayv2_integration.svc_checkout.id}"
}

# Route for /api/checkout/* paths
resource "aws_apigatewayv2_route" "svc_checkout" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/checkout/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_checkout.id}"
}

# Routes for invite-codes (handled by svc-events)
# Route for exact /api/invite-codes path
resource "aws_apigatewayv2_route" "svc_invite_codes_root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/invite-codes"
  target    = "integrations/${aws_apigatewayv2_integration.svc_events.id}"
}

# Route for /api/invite-codes/* paths
resource "aws_apigatewayv2_route" "svc_invite_codes" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/invite-codes/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_events.id}"
}

# Custom domain for API Gateway
resource "aws_apigatewayv2_domain_name" "main" {
  domain_name = "api.${var.domain_name}"

  domain_name_configuration {
    # Using existing certificate
    certificate_arn = "arn:aws:acm:us-east-2:665352994810:certificate/ce1aaef5-cb3a-46fe-bcfe-6a1cf5ddd6b4"
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "api.${var.domain_name}"
      Environment = var.environment
    }
  )
}

resource "aws_apigatewayv2_api_mapping" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  domain_name = aws_apigatewayv2_domain_name.main.id
  stage       = aws_apigatewayv2_stage.main.id
}
