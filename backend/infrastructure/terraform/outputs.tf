# ---------------------------------------------------------------------------
# VPC Outputs
# ---------------------------------------------------------------------------
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnets
}

# ---------------------------------------------------------------------------
# EKS Outputs
# ---------------------------------------------------------------------------
output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint for the EKS cluster API server"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data for the cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "eks_cluster_oidc_provider_arn" {
  description = "ARN of the OIDC provider for the EKS cluster"
  value       = module.eks.oidc_provider_arn
}

output "eks_node_security_group_id" {
  description = "Security group ID attached to EKS nodes"
  value       = module.eks.node_security_group_id
}

# ---------------------------------------------------------------------------
# RDS Outputs
# ---------------------------------------------------------------------------
output "rds_endpoints" {
  description = "RDS instance endpoints by group"
  value = {
    for key, instance in aws_db_instance.siteforge :
    key => {
      endpoint = instance.endpoint
      address  = instance.address
      port     = instance.port
    }
  }
}

output "rds_secret_arns" {
  description = "ARNs of Secrets Manager secrets containing RDS credentials"
  value = {
    for key, secret in aws_secretsmanager_secret.rds_credentials :
    key => secret.arn
  }
}

# ---------------------------------------------------------------------------
# ElastiCache Outputs
# ---------------------------------------------------------------------------
output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.siteforge.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "Redis reader endpoint"
  value       = aws_elasticache_replication_group.siteforge.reader_endpoint_address
}

# ---------------------------------------------------------------------------
# S3 / CloudFront Outputs
# ---------------------------------------------------------------------------
output "s3_assets_bucket_name" {
  description = "Name of the S3 assets bucket"
  value       = aws_s3_bucket.assets.id
}

output "s3_assets_bucket_arn" {
  description = "ARN of the S3 assets bucket"
  value       = aws_s3_bucket.assets.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.assets.id
}

output "cloudfront_distribution_domain" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.assets.domain_name
}

# ---------------------------------------------------------------------------
# ECR Outputs
# ---------------------------------------------------------------------------
output "ecr_repository_urls" {
  description = "URLs of ECR repositories for each service"
  value = {
    for key, repo in aws_ecr_repository.services :
    key => repo.repository_url
  }
}

# ---------------------------------------------------------------------------
# IAM Outputs
# ---------------------------------------------------------------------------
output "alb_controller_role_arn" {
  description = "IAM role ARN for the ALB controller"
  value       = module.alb_controller_irsa.iam_role_arn
}

output "cluster_autoscaler_role_arn" {
  description = "IAM role ARN for cluster autoscaler"
  value       = module.cluster_autoscaler_irsa.iam_role_arn
}
