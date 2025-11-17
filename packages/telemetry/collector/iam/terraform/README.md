This Terraform module creates an IAM policy and an IAM role suitable for attaching to the AWS Distro for OpenTelemetry (ADOT) Collector via IRSA (IAM Roles for Service Accounts) in EKS.

Usage example
-------------

1. Ensure your EKS cluster has an OIDC provider. You can get the OIDC provider ARN and URL from the AWS console or by running:

```
aws eks describe-cluster --name <cluster-name> --region <region> --query "cluster.identity.oidc"
```

2. From your Terraform root module:

```hcl
module "adot_iam" {
  source = "./packages/telemetry/collector/iam/terraform"

  region                   = "us-east-1"
  oidc_provider_arn        = "arn:aws:iam::123456789012:oidc-provider/oidc.eks.region.amazonaws.com/id/ABCDE"
  oidc_provider_url        = "https://oidc.eks.region.amazonaws.com/id/ABCDE"
  service_account_namespace = "aws-otel"
  service_account_name     = "adot-collector"
}
```

3. After `terraform apply`, note the `role_arn` output. Use that role ARN in your Helm `values.yaml` for the ADOT collector as the `serviceAccount.annotations.eks\.amazonaws\.com/role-arn` value (or with the `serviceAccount.create=false` pattern).

Notes
-----
- The module reads the JSON policy file located at `../iam-policy.json`. That file should exist in the repository and grant `cloudwatch:PutMetricData` and `logs:*` actions (a policy template is included).
- This module assumes EKS + IRSA. For ECS or EC2, use a task role or instance profile instead and attach the policy ARN to that role.

ADOT collector example
----------------------

An example `values.yaml` for deploying the ADOT collector (Helm) is available in the repo at:

```
packages/telemetry/collector/adot-values.yaml.example
```

This file shows a minimal setup to receive OTLP and forward metrics/traces to CloudWatch via EMF/awsemf exporter. After creating the IAM role with this module, replace the example role ARN in the `values.yaml` before deploying the collector.

CI / GitHub Actions example
---------------------------
Below is a minimal GitHub Actions job example that runs `terraform` against this module. It expects the repo to contain this module at the same path.

```yaml
name: deploy-telemetry-iam
on:
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-region: ${{ secrets.AWS_REGION }}
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }} # optional, if using OIDC or cross-account
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
      - name: Init & Apply
        run: |
          cd packages/telemetry/collector/iam/terraform
          terraform init
          terraform apply -auto-approve -var-file=terraform.tfvars
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
```

Local usage
-----------
1. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill your values.
2. From this module folder you can either run the included PowerShell helper or use Docker to avoid installing Terraform locally.

PowerShell helper (requires local terraform):

```powershell
.\deploy.ps1 -tfvars terraform.tfvars -AutoApprove
```

Run with Docker (no local terraform required):

```powershell
# Validate configuration
.\run-terraform-docker.ps1 -Action validate

# Init
.\run-terraform-docker.ps1 -Action init

# Plan with tfvars
.\run-terraform-docker.ps1 -Action plan -TfVars terraform.tfvars

# Apply (use AutoApprove carefully)
.\run-terraform-docker.ps1 -Action apply -TfVars terraform.tfvars -AutoApprove
```
