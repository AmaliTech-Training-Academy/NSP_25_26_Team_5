# IAM role: EC2 can pull from ECR
resource "aws_iam_role" "app" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
  tags = { Name = "${var.project_name}-ec2-role" }
}

resource "aws_iam_role_policy_attachment" "ecr" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "app" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.app.name
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

locals {
  user_data = templatefile("${path.module}/user_data.sh", {
    aws_region           = var.aws_region
    ecr_backend_repo     = var.ecr_backend_repo
    ecr_frontend_repo    = var.ecr_frontend_repo
    backend_image_tag    = var.backend_image_tag
    frontend_image_tag   = var.frontend_image_tag
    db_name              = var.db_name
    db_username          = var.db_username
    db_password          = var.db_password
    jwt_secret           = var.jwt_secret
  })
}

# Single instance in private subnet (NAT for ECR pull)
resource "aws_instance" "app" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = var.instance_type
  subnet_id                   = var.private_subnet_ids[0]
  vpc_security_group_ids     = [var.app_sg_id]
  iam_instance_profile        = aws_iam_instance_profile.app.name
  user_data                   = base64encode(local.user_data)
  user_data_replace_on_change = true

  tags = {
    Name = "${var.project_name}-app"
  }
}

# Register instance with both ALB target groups
resource "aws_lb_target_group_attachment" "backend" {
  target_group_arn = var.backend_target_group_arn
  target_id        = aws_instance.app.id
  port             = 8080
}

resource "aws_lb_target_group_attachment" "frontend" {
  target_group_arn = var.frontend_target_group_arn
  target_id        = aws_instance.app.id
  port             = 80
}
