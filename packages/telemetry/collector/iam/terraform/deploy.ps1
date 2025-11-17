# Helper script to run terraform for the telemetry IAM module.
# Run from anywhere; script will switch to module dir and run terraform commands.

param(
  [string]$tfvars = "terraform.tfvars",
  [switch]$AutoApprove
)

$ModuleDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "Switching to module directory: $ModuleDir"
Push-Location $ModuleDir

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
  Write-Error "terraform is not installed or not in PATH. Install Terraform and retry."
  Pop-Location
  exit 1
}

Write-Host "Initializing terraform..."
terraform init

$planArgs = @()
if (Test-Path $tfvars) { $planArgs += "-var-file=$tfvars" }

Write-Host "Running terraform plan..."
terraform plan @planArgs

$applyArgs = @()
if ($AutoApprove) { $applyArgs += "-auto-approve" }
if (Test-Path $tfvars) { $applyArgs += "-var-file=$tfvars" }

Write-Host "Applying terraform..."
terraform apply @applyArgs

Write-Host "Done. Returning to previous directory."
Pop-Location
