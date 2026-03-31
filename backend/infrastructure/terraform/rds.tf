# ---------------------------------------------------------------------------
# RDS PostgreSQL instances (grouped by domain)
# ---------------------------------------------------------------------------

locals {
  rds_instances = {
    identity = {
      databases  = ["auth_db", "user_db", "role_db"]
      instance   = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
      storage    = 100
      max_storage = 500
    }
    core = {
      databases  = ["tenant_db", "industry_db"]
      instance   = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
      storage    = 50
      max_storage = 200
    }
    website = {
      databases  = ["website_db", "template_db", "theme_db"]
      instance   = var.environment == "production" ? "db.r6g.xlarge" : "db.t4g.medium"
      storage    = 200
      max_storage = 1000
    }
    ai = {
      databases  = ["ai_db", "ai_version_db"]
      instance   = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
      storage    = 100
      max_storage = 500
    }
    commerce = {
      databases  = ["product_db", "inventory_db", "pricing_db"]
      instance   = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
      storage    = 100
      max_storage = 500
    }
    orders = {
      databases  = ["order_db", "payment_db", "refund_db", "wallet_db"]
      instance   = var.environment == "production" ? "db.r6g.xlarge" : "db.t4g.medium"
      storage    = 200
      max_storage = 1000
    }
    platform = {
      databases  = ["plugin_db", "domain_db", "email_db", "pos_db"]
      instance   = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
      storage    = 100
      max_storage = 500
    }
    insights = {
      databases  = ["analytics_db", "reporting_db", "notification_db"]
      instance   = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
      storage    = 200
      max_storage = 1000
    }
    system = {
      databases  = ["media_db", "config_db", "audit_db"]
      instance   = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
      storage    = 100
      max_storage = 500
    }
  }
}

# ---------------------------------------------------------------------------
# DB Subnet Group
# ---------------------------------------------------------------------------
resource "aws_db_subnet_group" "siteforge" {
  name       = "${var.project_name}-${var.environment}-db-subnet"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

# ---------------------------------------------------------------------------
# Security Group for RDS
# ---------------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
    description     = "Allow PostgreSQL access from EKS nodes"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}

# ---------------------------------------------------------------------------
# RDS Master Password
# ---------------------------------------------------------------------------
resource "random_password" "rds_master" {
  for_each = local.rds_instances

  length           = 32
  special          = true
  override_special = "!#$%^&*()-_=+[]{}|:,.<>?"
}

resource "aws_secretsmanager_secret" "rds_credentials" {
  for_each = local.rds_instances

  name = "${var.project_name}/${var.environment}/rds/${each.key}"

  tags = {
    RDSGroup = each.key
  }
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  for_each = local.rds_instances

  secret_id = aws_secretsmanager_secret.rds_credentials[each.key].id
  secret_string = jsonencode({
    username = "siteforge"
    password = random_password.rds_master[each.key].result
    host     = aws_db_instance.siteforge[each.key].address
    port     = 5432
  })
}

# ---------------------------------------------------------------------------
# RDS Instances
# ---------------------------------------------------------------------------
resource "aws_db_parameter_group" "siteforge" {
  name_prefix = "${var.project_name}-${var.environment}-pg16-"
  family      = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_db_instance" "siteforge" {
  for_each = local.rds_instances

  identifier = "${var.project_name}-${var.environment}-${each.key}"

  engine         = "postgres"
  engine_version = "16.2"
  instance_class = each.value.instance

  allocated_storage     = each.value.storage
  max_allocated_storage = each.value.max_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = each.value.databases[0]
  username = "siteforge"
  password = random_password.rds_master[each.key].result

  multi_az               = var.environment == "production"
  db_subnet_group_name   = aws_db_subnet_group.siteforge.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.siteforge.name

  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  deletion_protection       = var.environment == "production"
  skip_final_snapshot       = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${var.project_name}-${var.environment}-${each.key}-final" : null
  copy_tags_to_snapshot     = true

  performance_insights_enabled          = true
  performance_insights_retention_period = var.environment == "production" ? 731 : 7

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  auto_minor_version_upgrade = true

  tags = {
    Name       = "${var.project_name}-${var.environment}-${each.key}"
    RDSGroup   = each.key
    Databases  = join(",", each.value.databases)
  }
}

# ---------------------------------------------------------------------------
# ElastiCache Redis
# ---------------------------------------------------------------------------
resource "aws_elasticache_subnet_group" "siteforge" {
  name       = "${var.project_name}-${var.environment}-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-${var.environment}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
    description     = "Allow Redis access from EKS nodes"
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "siteforge" {
  replication_group_id = "${var.project_name}-${var.environment}-redis"
  description          = "SiteForge Redis cluster"

  node_type            = var.environment == "production" ? "cache.r6g.large" : "cache.t4g.medium"
  num_cache_clusters   = var.environment == "production" ? 3 : 1
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.siteforge.name
  security_group_ids   = [aws_security_group.redis.id]

  engine               = "redis"
  engine_version       = "7.1"
  parameter_group_name = "default.redis7"

  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled           = var.environment == "production"

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  snapshot_retention_limit = var.environment == "production" ? 7 : 1
  snapshot_window          = "02:00-03:00"
  maintenance_window       = "mon:03:00-mon:04:00"

  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.project_name}-${var.environment}-redis"
  }
}
