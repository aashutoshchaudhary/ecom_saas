variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "siteforge"
}

variable "environment" {
  description = "Deployment environment (staging, production)"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production."
  }
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

# ---------------------------------------------------------------------------
# VPC
# ---------------------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# ---------------------------------------------------------------------------
# Domain and CDN
# ---------------------------------------------------------------------------
variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "siteforge.ai"
}

variable "cdn_domain_names" {
  description = "Domain names for CloudFront distribution"
  type        = list(string)
  default     = []
}

variable "cdn_certificate_arn" {
  description = "ACM certificate ARN for CloudFront (must be in us-east-1)"
  type        = string
  default     = ""
}

variable "cors_allowed_origins" {
  description = "Allowed origins for CORS configuration"
  type        = list(string)
  default     = ["https://siteforge.ai", "https://*.siteforge.ai"]
}

# ---------------------------------------------------------------------------
# EKS
# ---------------------------------------------------------------------------
variable "eks_cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.29"
}

# ---------------------------------------------------------------------------
# RDS
# ---------------------------------------------------------------------------
variable "rds_instance_class" {
  description = "Default RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "rds_backup_retention_period" {
  description = "Number of days to retain RDS backups"
  type        = number
  default     = 7
}

# ---------------------------------------------------------------------------
# Tags
# ---------------------------------------------------------------------------
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
