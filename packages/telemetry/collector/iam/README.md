Guía para crear IAM Role/Policy para el ADOT Collector (CloudWatch)

Archivos relevantes:
- `iam-policy.json` : política mínima para permitir que el collector escriba métricas y logs en CloudWatch.

1) Crear la policy con AWS CLI

PowerShell / Bash:

```bash
aws iam create-policy --policy-name TicketeateTelemetryPolicy --policy-document file://packages/telemetry/collector/iam-policy.json
```

Esto devuelve el ARN de la policy; guárdalo para adjuntarlo al rol.

2) Opción: crear role para ECS/EC2 (ejemplo simplificado)

Si usas ECS task role o una EC2 instance role, crea el role y adjunta la policy:

```bash
# Crear role (ejemplo para EC2 assume)
aws iam create-role --role-name adot-collector-role --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

# Adjuntar policy creada antes (reemplaza ARN_POLICY por el ARN devuelto)
aws iam attach-role-policy --role-name adot-collector-role --policy-arn ARN_POLICY
```

3) Opción recomendada: EKS + IRSA (sin credenciales estáticas)

Resumen de pasos (alto nivel):
- Habilitar OIDC provider en el cluster EKS.
- Crear IAM Role con `sts:AssumeRoleWithWebIdentity` trust hacia el provider del cluster y condición `StringEquals` para el `sub` del serviceaccount.
- Adjuntar la policy `TicketeateTelemetryPolicy` al role.
- Anotar el ServiceAccount en Helm values (ej. `helm-values.yaml`) con la `eks.amazonaws.com/role-arn` apuntando al role creado.

Ejemplo Terraform (esquema) para IRSA

```hcl
data "aws_caller_identity" "current" {}
data "aws_eks_cluster" "cluster" { name = var.cluster_name }
data "aws_iam_policy_document" "irsa_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }
    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_provider_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:${var.namespace}:${var.service_account_name}"]
    }
  }
}

resource "aws_iam_role" "adot_role" {
  name               = "adot-collector-role-${var.cluster_name}"
  assume_role_policy = data.aws_iam_policy_document.irsa_assume.json
}

resource "aws_iam_role_policy_attachment" "adot_attach" {
  role       = aws_iam_role.adot_role.name
  policy_arn = var.ticketeate_policy_arn # ARN from created policy
}
```

Variables a definir en Terraform:
- `cluster_name`, `oidc_provider_arn`, `oidc_provider_url`, `namespace` (por ej. `aws-otel` o `aws-otel`), `service_account_name` (ej. `adot-collector`), `ticketeate_policy_arn`.

4) Verificación

- Si usas EKS + IRSA: despliega el collector e inspecciona logs del pod. El exporter `awsemf` debería poder crear log streams y enviar métricas.
- Si usas Docker local y variables AWS, revisa que no haya errores de credenciales.
