resource "aws_sns_topic" "main" {
  name              = "${var.project_name}-notifications"
  display_name      = "${var.project_name} notifications"
  kms_master_key_id = var.kms_key_id

  tags = { Name = "${var.project_name}-sns-topic" }
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.main.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
