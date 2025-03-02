# Azureプロバイダーの設定
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id
  client_id       = var.client_id
  client_secret   = var.client_secret
}

# リソースグループ
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-rg"
  location = var.location
}

# Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "${var.project_name}acr"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  sku                = "Basic"
  admin_enabled      = true
}

# MySQL Database
resource "azurerm_mysql_flexible_server" "main" {
  name                   = "${var.project_name}-mysql"
  location               = azurerm_resource_group.main.location
  resource_group_name    = azurerm_resource_group.main.name

  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password

  sku_name              = "B_Standard_B1s"
  version               = "8.0.21"

  storage {
    size_gb = 20
  }

  backup_retention_days = 7
  geo_redundant_backup_enabled = false
}

resource "azurerm_mysql_flexible_database" "main" {
  name                = var.db_name
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  charset             = "utf8"
  collation          = "utf8_unicode_ci"
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.project_name}-asp"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type            = "Linux"
  sku_name           = "B1"
}

# Backend Web App
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
    application_stack {
      docker_image_name = "${azurerm_container_registry.acr.login_server}/backend:latest"
    }
  }

  app_settings = {
    "WEBSITES_PORT"   = "8000"
    "DATABASE_URL"    = "mysql+pymysql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_mysql_flexible_server.main.fqdn}:3306/${var.db_name}"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"     = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = azurerm_container_registry.acr.admin_password
    "AZURE_OPENAI_ENDPOINT" = azurerm_cognitive_account.openai.endpoint
    "AZURE_OPENAI_KEY"     = azurerm_cognitive_account.openai.primary_access_key
    "AZURE_OPENAI_MODEL"   = "o3-mini"
  }
}

# Frontend Web App
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
    application_stack {
      docker_image_name = "${azurerm_container_registry.acr.login_server}/frontend:latest"
    }
  }

  app_settings = {
    "WEBSITES_PORT" = "3000"
    "NEXT_PUBLIC_API_URL" = "https://${azurerm_linux_web_app.backend.default_hostname}"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"     = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = azurerm_container_registry.acr.admin_password
  }
}

# Azure OpenAI Service
resource "azurerm_cognitive_account" "openai" {
  name                = "${var.project_name}-openai"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name           = "S0"

  tags = {
    environment = "production"
  }
}

# Azure OpenAI Deployment
resource "azurerm_cognitive_deployment" "gpt" {
  name                 = "o3-mini"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "o3-mini"
    version = "1"
  }

  sku {
    name     = "Standard"
    capacity = 1
  }
} 