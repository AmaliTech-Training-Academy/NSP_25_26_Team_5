resource "aws_amplify_app" "frontend" {
  name                 = "${var.project_name}-frontend"
  repository           = var.repo_url
  platform             = "WEB"
  iam_service_role_arn = aws_iam_role.amplify_build_role.arn
  access_token         = var.github_token != "" ? var.github_token : null

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/build
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
  EOT

  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  environment_variables = {
    ENV = "production"
  }
}

resource "aws_iam_role" "amplify_build_role" {
  name = "${var.project_name}-amplify-build-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "amplify_s3" {
  role       = aws_iam_role.amplify_build_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "amplify_cloudwatch" {
  role       = aws_iam_role.amplify_build_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "main"

  enable_auto_build = true

  environment_variables = {
    API_URL = var.api_url
  }
}