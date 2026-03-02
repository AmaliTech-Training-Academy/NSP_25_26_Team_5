output "db_endpoint_address" {
  value = aws_db_instance.main.address
}
output "db_endpoint_port" {
  value = tostring(aws_db_instance.main.port)
}
