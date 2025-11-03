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
  TicketEate Infrastructure Deployed!
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
    2. SSH to Nginx: ${format("ssh -i %s.pem ubuntu@%s", var.key_name, aws_instance.nginx.public_ip)}
    3. Deploy containers using GitHub Actions
    4. Configure SSL with: sudo certbot --nginx -d ${var.domain_name}
  
  ==========================================
  EOT
}
