output "backend_url" {
  value = "https://${azurerm_linux_web_app.server.default_hostname}"
}

output "frontend_url" {
  value = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}

output "frontend_webapp_name" {
  value = azurerm_linux_web_app.frontend.name
}

output "backend_webapp_name" {
  value = azurerm_linux_web_app.server.name
}

output "database_url" {
  value = azurerm_mysql_flexible_server.main.fqdn
  sensitive = true
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "openai_endpoint" {
  value = azurerm_cognitive_account.openai.endpoint
  sensitive = true
}

output "openai_key" {
  value = azurerm_cognitive_account.openai.primary_access_key
  sensitive = true
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
  description = "The name of the storage account"
}

output "storage_account_key" {
  value = azurerm_storage_account.main.primary_access_key
  description = "The primary access key for the storage account"
  sensitive = true
}

output "storage_container_name" {
  value = azurerm_storage_container.main.name
  description = "The name of the storage container"
} 