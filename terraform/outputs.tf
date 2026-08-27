output "public_ip" {
  value       = aws_eip.web_eip.public_ip
  description = "The public Elastic IP of the Cardly web server. Point your domain's A record to this IP."
}

output "ssh_connection_string" {
  value       = var.key_name != "" ? "ssh -i /path/to/${var.key_name}.pem ubuntu@${aws_eip.web_eip.public_ip}" : "ssh ubuntu@${aws_eip.web_eip.public_ip} (Requires key setup)"
  description = "SSH connection string to log into the EC2 instance."
}

output "app_url" {
  value       = var.domain_name != "localhost" ? "https://${var.domain_name}" : "http://${aws_eip.web_eip.public_ip}"
  description = "URL to access the Cardly application."
}

output "bootstrap_logs_command" {
  value       = "ssh ubuntu@${aws_eip.web_eip.public_ip} 'sudo tail -f /var/log/user-data.log'"
  description = "Command to monitor the initial Docker setup process."
}
