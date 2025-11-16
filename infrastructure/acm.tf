# ACM Certificate for API Gateway custom domain
# Certificate must be in us-east-1 for CloudFront/API Gateway edge-optimized
# For regional API Gateway, certificate can be in the same region (us-east-2)

resource "aws_acm_certificate" "api" {
  domain_name       = "api.${var.domain_name}"
  validation_method = "DNS"

  tags = merge(
    var.common_tags,
    {
      Name        = "api.${var.domain_name}"
      Environment = var.environment
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Output certificate ARN for reference
output "api_certificate_arn" {
  description = "ARN of the ACM certificate for api.ticketeate.com.ar"
  value       = aws_acm_certificate.api.arn
}

# Output validation records for DNS configuration
output "api_certificate_validation_records" {
  description = "DNS validation records for ACM certificate"
  value = [
    for dvo in aws_acm_certificate.api.domain_validation_options : {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  ]
}
