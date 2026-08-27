variable "aws_region" {
  type        = string
  description = "AWS region to deploy resources in"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Name of the project used for naming resources"
  default     = "cardly"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance size"
  default     = "t3.micro" # Free-tier eligible in many regions
}

variable "ami_id" {
  type        = string
  description = "Ubuntu LTS AMI ID. Defaults to Ubuntu 24.04 LTS in us-east-1"
  default     = "" # If empty, main.tf will auto-discover the latest Ubuntu 24.04 LTS AMI
}

variable "key_name" {
  type        = string
  description = "The name of the AWS SSH key pair to associate with the instance (optional but highly recommended)"
  default     = ""
}

variable "domain_name" {
  type        = string
  description = "The domain name pointing to this server (e.g., cardly.example.com). Used for Caddy SSL."
  default     = "localhost"
}

variable "git_repo_url" {
  type        = string
  description = "URL of the Git repository to clone on the server"
  default     = "https://github.com/suzzaanDEV/visiting-card-app.git"
}
