# Outputs - Información útil después del apply

output "nginx_public_ip" {
  description = "Public IP of Nginx instance"
  value       = aws_instance.nginx.public_ip
}

output "nginx_private_ip" {
  description = "Private IP of Nginx instance"
  value       = aws_instance.nginx.private_ip
}

output "nextjs_1_public_ip" {
  description = "Public IP of Next.js instance 1"
  value       = aws_instance.nextjs_1.public_ip
}

output "nextjs_1_private_ip" {
  description = "Private IP of Next.js instance 1"
  value       = aws_instance.nextjs_1.private_ip
}

output "nextjs_2_public_ip" {
  description = "Public IP of Next.js instance 2"
  value       = aws_instance.nextjs_2.public_ip
}

output "nextjs_2_private_ip" {
  description = "Private IP of Next.js instance 2"
  value       = aws_instance.nextjs_2.private_ip
}

output "redis_private_ip" {
  description = "Private IP of Redis instance"
  value       = aws_instance.redis.private_ip
}

output "redis_public_ip" {
  description = "Public IP of Redis instance"
  value       = aws_instance.redis.public_ip
}

output "lambda_function_names" {
  description = "Names of Lambda functions"
  value = {
    users     = aws_lambda_function.svc_users.function_name
    events    = aws_lambda_function.svc_events.function_name
    producers = aws_lambda_function.svc_producers.function_name
    checkout  = aws_lambda_function.svc_checkout.function_name
  }
}

output "api_gateway_urls" {
  description = "API Gateway URLs"
  value = {
    base_url  = aws_apigatewayv2_stage.main.invoke_url
    users     = "${aws_apigatewayv2_stage.main.invoke_url}/api/users"
    events    = "${aws_apigatewayv2_stage.main.invoke_url}/api/events"
    producers = "${aws_apigatewayv2_stage.main.invoke_url}/api/producers"
    checkout  = "${aws_apigatewayv2_stage.main.invoke_url}/api/checkout"
  }
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value = {
    for repo in var.ecr_repositories :
    repo => aws_ecr_repository.services[repo].repository_url
  }
}

output "ssh_commands" {
  description = "SSH commands to connect to instances"
  value = {
    nginx    = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.nginx.public_ip}"
    nextjs_1 = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.nextjs_1.public_ip}"
    nextjs_2 = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.nextjs_2.public_ip}"
    redis    = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.redis.private_ip}"
  }
}

output "deployment_summary" {
  description = "Summary of deployment"
  value = <<-EOT
  
  ==========================================
  Ticketeate Infrastructure Deployed!
  ==========================================
  
  🌐 Frontend:
    - Next.js 1: ${aws_instance.nextjs_1.public_ip}
    - Next.js 2: ${aws_instance.nextjs_2.public_ip}
  
  🔧 Infrastructure:
    - Nginx: ${aws_instance.nginx.public_ip}
    - Redis: ${aws_instance.redis.private_ip} (private)
  
  ⚡ Lambda APIs:
    - Base URL: ${aws_apigatewayv2_stage.main.invoke_url}
    - Users: ${aws_apigatewayv2_stage.main.invoke_url}/api/users
    - Events: ${aws_apigatewayv2_stage.main.invoke_url}/api/events
    - Producers: ${aws_apigatewayv2_stage.main.invoke_url}/api/producers
    - Checkout: ${aws_apigatewayv2_stage.main.invoke_url}/api/checkout
  
  📋 Next Steps:
    1. Configure DNS: ${var.domain_name} → ${aws_instance.nginx.public_ip}
    2. Upload environment variables: ./scripts/upload-env-vars.ps1 -Environment production
    3. SSH to Nginx: ${format("ssh -i %s.pem ubuntu@%s", var.key_name, aws_instance.nginx.public_ip)}
    4. Deploy Next.js: sudo ~/deploy-nextjs.sh (on each EC2 instance)
    5. Configure SSL with: sudo certbot --nginx -d ${var.domain_name}
  
  📚 Documentation:
    - Environment Variables: infrastructure/docs/ENV_QUICKSTART.md
    - Full Docs: infrastructure/docs/ENVIRONMENT_VARIABLES.md
  
  ==========================================
  EOT
}

output "environment_variables_info" {
  description = "Information about environment variables configuration"
  value = <<-EOT
  
  🔐 Environment Variables Configuration
  
  Variables are managed via AWS Systems Manager Parameter Store:
  Path: /ticketeate/${var.environment}/*
  
  To upload variables:
    cd infrastructure/scripts
    ./upload-env-vars.ps1 -Environment ${var.environment}
  
  To view current variables:
    aws ssm get-parameters-by-path --path /ticketeate/${var.environment}/ --region ${var.aws_region}
  
  Lambda functions will automatically receive all variables from Parameter Store.
  EC2 instances require running deploy-nextjs.sh script to inject variables.
  
  See infrastructure/docs/ENVIRONMENT_VARIABLES.md for details.
  EOT
}
