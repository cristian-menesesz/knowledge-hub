# Terraform Infrastructure

This directory contains the Infrastructure as Code (IaC) for the Knowledge Hub platform using
Terraform.

## 📁 Structure

```
terraform/
├── environments/          # Environment-specific configurations
│   ├── dev/              # Development environment
│   ├── staging/          # Staging environment
│   └── prod/             # Production environment
├── modules/              # Reusable Terraform modules
│   ├── networking/       # VPC, subnets, security groups
│   ├── compute/          # EC2, ECS, EKS resources
│   ├── database/         # RDS, DocumentDB, ElastiCache
│   └── storage/          # S3, EFS storage
├── backend.tf            # Terraform backend configuration
├── providers.tf          # Provider configurations
└── README.md             # This file
```

## 🚀 Prerequisites

- Terraform >= 1.6.0
- AWS CLI configured with appropriate credentials
- AWS account with necessary permissions

## 🔧 Setup

### 1. Backend Configuration

The backend is configured to use S3 for state storage and DynamoDB for state locking.

```bash
# Create S3 bucket for state (one-time setup)
aws s3 mb s3://knowledge-hub-terraform-state-${AWS_ACCOUNT_ID}

# Create DynamoDB table for state locking (one-time setup)
aws dynamodb create-table \
  --table-name knowledge-hub-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 2. Initialize Terraform

```bash
cd infrastructure/terraform/environments/dev
terraform init
```

### 3. Plan Infrastructure

```bash
terraform plan -out=tfplan
```

### 4. Apply Infrastructure

```bash
terraform apply tfplan
```

## 🌍 Environments

### Development

- **Purpose**: Developer testing and experimentation
- **Resources**: Minimal, cost-optimized
- **State**: `s3://knowledge-hub-terraform-state/dev/terraform.tfstate`

### Staging

- **Purpose**: Pre-production testing
- **Resources**: Production-like, smaller scale
- **State**: `s3://knowledge-hub-terraform-state/staging/terraform.tfstate`

### Production

- **Purpose**: Live user traffic
- **Resources**: High availability, auto-scaling
- **State**: `s3://knowledge-hub-terraform-state/prod/terraform.tfstate`

## 📦 Modules

### Networking Module

Provisions VPC, subnets, NAT gateways, and security groups.

**Inputs:**

- `environment` - Environment name (dev/staging/prod)
- `vpc_cidr` - VPC CIDR block
- `availability_zones` - List of AZs

**Outputs:**

- `vpc_id` - VPC ID
- `public_subnet_ids` - Public subnet IDs
- `private_subnet_ids` - Private subnet IDs

### Compute Module

Provisions EKS cluster or ECS services.

**Inputs:**

- `cluster_name` - Kubernetes cluster name
- `node_instance_types` - EC2 instance types for nodes

**Outputs:**

- `cluster_endpoint` - Kubernetes API endpoint
- `cluster_name` - Cluster name

## 🔒 Security

### State File Security

- **Encryption**: State files are encrypted at rest in S3
- **Versioning**: S3 versioning enabled for state file history
- **Access Control**: IAM policies restrict access to authorized users only

### Secrets Management

- **Never commit secrets** to version control
- **Use AWS Secrets Manager** for sensitive data
- **Environment variables** for non-sensitive configuration

### Best Practices

- Use remote backend for team collaboration
- Enable state locking to prevent concurrent modifications
- Use workspaces or separate state files per environment
- Implement least privilege IAM policies
- Enable CloudTrail for audit logging

## 📝 Variables

### Required Variables

- `aws_region` - AWS region (default: us-east-1)
- `environment` - Environment name (dev/staging/prod)
- `project_name` - Project name (knowledge-hub)

### Optional Variables

- `tags` - Resource tags (map)
- `enable_monitoring` - Enable enhanced monitoring (bool)

## 🔄 Workflow

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/infra-update

# 2. Make Terraform changes
vim infrastructure/terraform/environments/dev/main.tf

# 3. Validate syntax
terraform validate

# 4. Format code
terraform fmt -recursive

# 5. Plan changes
terraform plan

# 6. Review plan output carefully

# 7. Apply if plan looks good
terraform apply

# 8. Commit changes
git add .
git commit -m "infra(terraform): description of changes"
git push origin feature/infra-update
```

### Destroying Resources

```bash
# WARNING: This will destroy all resources!
terraform destroy

# Or destroy specific resources
terraform destroy -target=module.networking
```

## 📊 Cost Optimization

- **Development**: Use t3.micro instances, single AZ
- **Staging**: Use t3.small instances, multi-AZ when needed
- **Production**: Right-size based on actual usage metrics

### Cost Monitoring

- Tag all resources with `Environment` and `Project`
- Use AWS Cost Explorer to track spending
- Set up billing alerts

## 🆘 Troubleshooting

### State Lock Issues

```bash
# If state is locked and you're sure no one else is using it
terraform force-unlock <lock-id>
```

### Import Existing Resources

```bash
# Import existing VPC
terraform import module.networking.aws_vpc.main vpc-xxxxx
```

### Debugging

```bash
# Enable detailed logging
export TF_LOG=DEBUG
terraform plan
```

## 📚 Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on contributing to infrastructure code.

---

**Last Updated**: January 25, 2026  
**Status**: Initial setup complete
