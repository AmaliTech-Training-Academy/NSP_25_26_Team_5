output "topic_arn" {
  value       = aws_sns_topic.main.arn
  description = "SNS topic ARN for alarms or other publishers"
}

output "topic_name" {
  value       = aws_sns_topic.main.name
  description = "SNS topic name"
}
