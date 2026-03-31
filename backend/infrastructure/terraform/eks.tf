# ---------------------------------------------------------------------------
# EKS Cluster
# ---------------------------------------------------------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.8"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = "1.29"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent    = true
      before_compute = true
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        }
      })
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    }
  }

  # ---------------------------------------------------------------------------
  # Managed Node Groups
  # ---------------------------------------------------------------------------
  eks_managed_node_groups = {
    # System node group for cluster infrastructure
    system = {
      name            = "system"
      instance_types  = ["t3.medium"]
      min_size        = 3
      max_size        = 3
      desired_size    = 3

      labels = {
        workload-type = "system"
      }

      taints = [
        {
          key    = "CriticalAddonsOnly"
          effect = "NO_SCHEDULE"
        }
      ]

      ami_type       = "AL2_x86_64"
      capacity_type  = "ON_DEMAND"

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 50
            volume_type           = "gp3"
            iops                  = 3000
            throughput            = 125
            encrypted             = true
            delete_on_termination = true
          }
        }
      }

      tags = {
        NodeGroup = "system"
      }
    }

    # Application node group for microservices
    app = {
      name            = "app"
      instance_types  = ["t3.large"]
      min_size        = 3
      max_size        = 12
      desired_size    = 3

      labels = {
        workload-type = "application"
      }

      ami_type       = "AL2_x86_64"
      capacity_type  = "ON_DEMAND"

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 100
            volume_type           = "gp3"
            iops                  = 3000
            throughput            = 125
            encrypted             = true
            delete_on_termination = true
          }
        }
      }

      tags = {
        NodeGroup = "app"
      }
    }

    # AI/GPU node group for ML workloads
    ai = {
      name            = "ai"
      instance_types  = ["g4dn.xlarge"]
      min_size        = 0
      max_size        = 4
      desired_size    = 0

      labels = {
        workload-type = "ai"
        "nvidia.com/gpu" = "true"
      }

      taints = [
        {
          key    = "nvidia.com/gpu"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      ami_type       = "AL2_x86_64_GPU"
      capacity_type  = "SPOT"

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 200
            volume_type           = "gp3"
            iops                  = 3000
            throughput            = 125
            encrypted             = true
            delete_on_termination = true
          }
        }
      }

      tags = {
        NodeGroup = "ai"
      }
    }
  }

  tags = {
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# EBS CSI Driver IRSA
# ---------------------------------------------------------------------------
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.37"

  role_name             = "${var.project_name}-${var.environment}-ebs-csi"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = {
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# AWS Load Balancer Controller IRSA
# ---------------------------------------------------------------------------
module "alb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.37"

  role_name                              = "${var.project_name}-${var.environment}-alb-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }

  tags = {
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# Cluster Autoscaler IRSA
# ---------------------------------------------------------------------------
module "cluster_autoscaler_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.37"

  role_name                        = "${var.project_name}-${var.environment}-cluster-autoscaler"
  attach_cluster_autoscaler_policy = true
  cluster_autoscaler_cluster_names = [module.eks.cluster_name]

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:cluster-autoscaler"]
    }
  }

  tags = {
    Environment = var.environment
  }
}
