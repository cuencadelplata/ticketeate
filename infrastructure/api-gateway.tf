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
    allow_headers = ["*"]
    expose_headers = ["*"]
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
resource "aws_apigatewayv2_route" "svc_users" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/users/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_users.id}"
}

# Routes for svc-events
resource "aws_apigatewayv2_route" "svc_events" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/events/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_events.id}"
}

# Routes for svc-producers
resource "aws_apigatewayv2_route" "svc_producers" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/producers/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_producers.id}"
}

# Routes for svc-checkout
resource "aws_apigatewayv2_route" "svc_checkout" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/checkout/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.svc_checkout.id}"
}

# Custom domain (optional - requires ACM certificate)
# Uncomment and configure when ready to use custom domain
/*
resource "aws_apigatewayv2_domain_name" "main" {
  domain_name = "api.${var.domain_name}"

  domain_name_configuration {
    certificate_arn = var.acm_certificate_arn
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
*/
