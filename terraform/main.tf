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

# ACRの診断設定
resource "azurerm_monitor_diagnostic_setting" "acr" {
  name                       = "acr-diagnostics"
  target_resource_id         = azurerm_container_registry.acr.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category_group = "audit"
  }
}

# MySQL Database
resource "azurerm_mysql_flexible_server" "main" {
  name                   = "${var.project_name}-mysql"
  location               = azurerm_resource_group.main.location
  resource_group_name    = azurerm_resource_group.main.name

  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password

  sku_name              = "B_Standard_B1ms"
  version               = "8.0.21"

  storage {
    size_gb = 20
  }

  backup_retention_days = 7
  geo_redundant_backup_enabled = false

  # パブリックアクセスを許可
  delegated_subnet_id    = null
  private_dns_zone_id    = null
}

resource "azurerm_mysql_flexible_database" "main" {
  name                = var.db_name
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  charset             = "utf8"
  collation          = "utf8_unicode_ci"
  depends_on = [
    azurerm_mysql_flexible_server.main,
    azurerm_mysql_flexible_server_firewall_rule.allow_azure
  ]
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
resource "azurerm_linux_web_app" "server" {
  name                = "${var.project_name}-server"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
    application_stack {
      docker_image_name = "${azurerm_container_registry.acr.login_server}/backend:latest"
    }
    cors {
      allowed_origins     = ["https://maketa-frontend-app.azurewebsites.net"]
      support_credentials = true
    }
  }

  app_settings = {
    "WEBSITES_PORT"   = "8000"
    "DATABASE_URL"    = "mysql+pymysql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_mysql_flexible_server.main.fqdn}:3306/${var.db_name}"
    "ACR_URL"          = "https://${azurerm_container_registry.acr.login_server}"
    "ACR_USERNAME"     = azurerm_container_registry.acr.admin_username
    "ACR_PASSWORD"     = azurerm_container_registry.acr.admin_password
    "AZURE_OPENAI_ENDPOINT" = azurerm_cognitive_account.openai.endpoint
    "AZURE_OPENAI_KEY"     = azurerm_cognitive_account.openai.primary_access_key
    "AZURE_OPENAI_MODEL"   = "gpt-4o-mini"
    "HTTP_LOGGING_DAYS" = "7"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_ENABLE_CI" = "true"
    "WEAVIATE_URL"    = "https://${azurerm_container_app.weaviate.ingress[0].fqdn}"
    "ENVIRONMENT"     = "production"
    "STARTUP_TIMEOUT" = "300"
  }

  https_only = true
  depends_on = [azurerm_mysql_flexible_database.main]
}

# Frontend Web App
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend-app"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
    application_stack {
      docker_image_name = "${azurerm_container_registry.acr.login_server}/frontend:latest"
      docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }

  app_settings = {
    "WEBSITES_PORT" = "3000"
    "NEXT_PUBLIC_API_URL" = "https://${azurerm_linux_web_app.server.default_hostname}"
    "NEXT_PUBLIC_FIREBASE_API_KEY"        = var.firebase_api_key
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"    = "${var.project_name}.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"     = var.project_name
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" = "${var.project_name}.appspot.com"
    "NEXT_PUBLIC_FIREBASE_APP_ID"         = var.firebase_app_id
  }

  https_only = true
}

# Azure OpenAI Service
resource "azurerm_cognitive_account" "openai" {
  name                = "${var.project_name}-openai"
  location            = "swedencentral"
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name           = "S0"

  tags = {
    environment = "production"
  }
}

# Azure OpenAI Deployment
resource "azurerm_cognitive_deployment" "gpt" {
  name                 = "gpt-4o-mini"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4o-mini"
    version = "2024-07-18"
  }

  sku {
    name     = "Standard"
    capacity = 1
  }
}

# Azure Servicesからのアクセスを許可
resource "azurerm_mysql_flexible_server_firewall_rule" "allow_azure" {
  name                = "allow-azure-services"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.project_name}-law"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                = "PerGB2018"
  retention_in_days  = 30
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "${var.project_name}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name       = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

# Weaviate Container App
resource "azurerm_container_app" "weaviate" {
  name                         = "${var.project_name}-weaviate"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name         = azurerm_resource_group.main.name
  revision_mode               = "Single"

  template {
    container {
      name   = "weaviate"
      image  = "cr.weaviate.io/semitechnologies/weaviate:1.26.1"
      cpu    = "1.0"
      memory = "2Gi"

      env {
        name  = "OPENAI_API_KEY"
        value = var.openai_api_key
      }
      env {
        name  = "QUERY_DEFAULTS_LIMIT"
        value = "25"
      }
      env {
        name  = "AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED"
        value = "true"
      }
      env {
        name  = "PERSISTENCE_DATA_PATH"
        value = "/var/lib/weaviate"
      }
      env {
        name  = "DEFAULT_VECTORIZER_MODULE"
        value = "text2vec-openai"
      }
      env {
        name  = "ENABLE_MODULES"
        value = "text2vec-openai,generative-openai"
      }
      env {
        name  = "CLUSTER_HOSTNAME"
        value = "node1"
      }
    }

    min_replicas = 1
    max_replicas = 1
  }

  ingress {
    external_enabled = true
    target_port     = 8080
    transport       = "http"
    traffic_weight {
      latest_revision = true
      percentage     = 100
    }
  }
} 