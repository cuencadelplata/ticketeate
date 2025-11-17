output "policy_arn" {
  description = "ARN of the created IAM policy"
  value       = aws_iam_policy.telemetry_policy.arn
}

output "role_arn" {
  description = "ARN of the IAM role for IRSA"
  value       = aws_iam_role.adot_irsa_role.arn
}

output "role_name" {
  description = "Name of the created IAM role"
  value       = aws_iam_role.adot_irsa_role.name
}
