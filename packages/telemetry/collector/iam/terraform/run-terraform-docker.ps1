<#
Run Terraform inside the official HashiCorp Docker image so you don't need to install terraform locally.

Usage examples:
  .\run-terraform-docker.ps1 -Action init
  .\run-terraform-docker.ps1 -Action validate
  .\run-terraform-docker.ps1 -Action plan -TfVars terraform.tfvars
  .\run-terraform-docker.ps1 -Action apply -TfVars terraform.tfvars -AutoApprove
#>

param(
  [ValidateSet('init','validate','plan','apply')]
  [string]$Action = 'validate',
  [string]$TfVars = '',
  [switch]$AutoApprove
)

function Get-DockerPath([string]$path) {
  # Convert Windows path to a form Docker can mount in most setups: replace backslashes
  return ($path -replace '\\','/')
}

$modulePath = Get-Location -PSProvider FileSystem
$hostPath = Get-DockerPath $modulePath.Path

$baseCmd = @(
  'run','--rm',
  '-v', "${hostPath}:/workspace",
  '-w','/workspace',
  'hashicorp/terraform:latest'
)

switch ($Action) {
  'init' {
    $args = @('init','-input=false')
  }
  'validate' {
    $args = @('validate')
  }
  'plan' {
    $args = @('plan')
    if ($TfVars -ne '' -and (Test-Path $TfVars)) { $args += "-var-file=$TfVars" }
  }
  'apply' {
    $args = @('apply')
    if ($TfVars -ne '' -and (Test-Path $TfVars)) { $args += "-var-file=$TfVars" }
    if ($AutoApprove) { $args += '-auto-approve' }
  }
}

$dockerCmd = $baseCmd + $args

Write-Host "Running: docker $($dockerCmd -join ' ')"

& docker @dockerCmd
