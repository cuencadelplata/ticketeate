provider "aws" {
  region = var.region
}

# Create IAM policy from the supplied JSON file (already present in repo)
data "local_file" "iam_policy_json" {
  filename = "${path.module}/../iam-policy.json"
}

resource "aws_iam_policy" "telemetry_policy" {
  name        = var.policy_name
  description = "Policy for ADOT collector to publish metrics and logs to CloudWatch"
  policy      = data.local_file.iam_policy_json.content
}

# Create an IAM role for IRSA (assume role with OIDC conditions)
resource "aws_iam_role" "adot_irsa_role" {
  name = var.role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(var.oidc_provider_url, "https://", "")}:sub" = "system:serviceaccount:${var.service_account_namespace}:${var.service_account_name}"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_policy" {
  role       = aws_iam_role.adot_irsa_role.name
  policy_arn = aws_iam_policy.telemetry_policy.arn
}
provider "aws" {
  region = var.region
}

// Read policy JSON from repository
resource "aws_iam_policy" "ticketeate_telemetry" {
  name   = var.policy_name
  policy = file("${path.module}/../iam-policy.json")
}

data "aws_iam_policy_document" "irsa_assume" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_provider_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:${var.service_account_namespace}:${var.service_account_name}"]
    }
  }
}

resource "aws_iam_role" "adot_irsa_role" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.irsa_assume.json
}

resource "aws_iam_role_policy_attachment" "attach_policy" {
  role       = aws_iam_role.adot_irsa_role.name
  policy_arn = aws_iam_policy.ticketeate_telemetry.arn
}

output "policy_arn" {
  description = "ARN of the created policy"
  value       = aws_iam_policy.ticketeate_telemetry.arn
}

output "role_arn" {
  description = "ARN of the created IAM Role (for IRSA)"
  value       = aws_iam_role.adot_irsa_role.arn
}
