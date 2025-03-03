variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "maketa"
}

variable "location" {
  description = "リソースのリージョン"
  type        = string
  default     = "japaneast"
}

variable "db_admin_username" {
  description = "データベース管理者のユーザー名"
  type        = string
}

variable "db_admin_password" {
  description = "データベース管理者のパスワード"
  type        = string
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "maketa"
}

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "tenant_id" {
  description = "Azure tenant ID"
  type        = string
}

variable "client_id" {
  description = "Azure client ID"
  type        = string
}

variable "client_secret" {
  description = "Azure client secret"
  type        = string
  sensitive   = true
}

variable "firebase_api_key" {
  description = "Firebase API Key"
  type        = string
}

variable "firebase_app_id" {
  description = "Firebase App ID"
  type        = string
}

variable "firebase_auth_domain" {
  description = "Firebase Auth Domain"
  type        = string
  default     = "maketa.firebaseapp.com"
}

variable "firebase_project_id" {
  description = "Firebase Project ID"
  type        = string
  default     = "maketa"
}

variable "firebase_storage_bucket" {
  description = "Firebase Storage Bucket"
  type        = string
  default     = "maketa.appspot.com"
} 