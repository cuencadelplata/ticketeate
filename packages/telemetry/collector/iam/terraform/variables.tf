variable "region" {
  description = "AWS region to create resources in"
  type        = string
  default     = "us-east-1"
}

variable "policy_name" {
  description = "Name for the IAM policy"
  type        = string
  default     = "TicketeateTelemetryPolicy"
}

variable "role_name" {
  description = "Name for the IAM role to create for the collector (IRSA)"
  type        = string
  default     = "adot-collector-role"
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS cluster OIDC provider (for IRSA)"
  type        = string
}

variable "oidc_provider_url" {
  description = "OIDC provider URL (e.g. https://oidc.eks.<region>.amazonaws.com/id/XXXX)"
  type        = string
}

variable "service_account_namespace" {
  description = "Kubernetes namespace of the service account"
  type        = string
  default     = "aws-otel"
}

variable "service_account_name" {
  description = "Kubernetes service account name that will assume the role"
  type        = string
  default     = "adot-collector"
}
