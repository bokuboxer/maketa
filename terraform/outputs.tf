output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_url" {
  value = "https://${azurerm_linux_web_app.frontend.default_hostname}"
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