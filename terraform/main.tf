##### VARIABLE DEFINITIONS #####

# Name prefix for resources
variable "prefix" {
  type    = string
  default = "txmaster"
}

variable "location" {
  type    = string
  default = "westeurope"
}

##### INITIALISE AZURE PROVIDER #####
provider "azurerm" {
  version = "=2.1.0"
  features {}
}

##### RESOURCES #####

# Random integer to ensure uniquesness of resource names.
resource "random_integer" "random" {
  min = 10000
  max = 99999
}

# Resource Group

resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-${random_integer.random.result}-rg"
  location = var.location
}

# Storage Account resources

resource "azurerm_storage_account" "storage" {
  name                     = "${var.prefix}${random_integer.random.result}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "function_output" {
  name                 = "function-output"
  storage_account_name = azurerm_storage_account.storage.name
}

resource "azurerm_storage_container" "function_code" {
  name                 = "function-code"
  storage_account_name = azurerm_storage_account.storage.name
}

resource "azurerm_storage_container" "symbiote_filestore" {
  name                 =  var.s3_bucket_name
  storage_account_name = azurerm_storage_account.storage.name
}

resource "azurerm_storage_blob" "function_code" {
  name                   = "function.zip"
  storage_account_name   = azurerm_storage_account.storage.name
  storage_container_name = azurerm_storage_container.function_code.name
  type                   = "Block"
  source                 = data.archive_file.zip.output_path
}

# SAS token for Function App to access Storage Account

data "azurerm_storage_account_sas" "sas" {
  connection_string = azurerm_storage_account.storage.primary_connection_string
  https_only        = true
  start             = timestamp()
  expiry            = timeadd(timestamp(), "60m")
  resource_types {
    object    = true
    container = false
    service   = false
  }
  services {
    blob  = true
    queue = false
    table = false
    file  = false
  }
  permissions {
    read    = true
    write   = false
    delete  = false
    list    = false
    add     = false
    create  = false
    update  = false
    process = false
  }
}

# Function app resources

resource "azurerm_app_service_plan" "asp" {
  name                = "${var.prefix}-${random_integer.random.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  kind                = "FunctionApp"
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "function" {
  name                      = "${var.prefix}-${random_integer.random.result}"
  location                  = azurerm_resource_group.rg.location
  resource_group_name       = azurerm_resource_group.rg.name
  app_service_plan_id       = azurerm_app_service_plan.asp.id
  storage_connection_string = azurerm_storage_account.storage.primary_connection_string
  version                   = "~2"

  app_settings = {
    https_only                        = true
    LOG_LEVEL                         = var.default_log_level
    FUNCTIONS_WORKER_RUNTIME          = "node"
    WEBSITE_NODE_DEFAULT_VERSION      = "~10"
    FUNCTION_APP_EDIT_MODE            = "readwrite"
    HASH                              = "${base64encode(filesha256("${data.archive_file.zip.output_path}"))}"
    WEBSITE_RUN_FROM_PACKAGE          = "https://${azurerm_storage_account.storage.name}.blob.core.windows.net/${azurerm_storage_container.function_code.name}/${azurerm_storage_blob.function_code.name}${data.azurerm_storage_account_sas.sas.sas}"
    OUTPUT_STORAGE_CONNECTION_STRING  = azurerm_storage_account.storage.primary_connection_string
    STORAGE_CONNECTION_STRING         = azurerm_storage_account.storage.primary_connection_string
    OUTPUT_STORAGE_NAME               = "${var.prefix}${random_integer.random.result}"
    OUTPUT_COSMOSDB_CONNECTION_STRING = "AccountEndpoint=${azurerm_cosmosdb_account.cosmos_account.endpoint};AccountKey=${azurerm_cosmosdb_account.cosmos_account.primary_master_key};"
    COSMOSDB_CONNECTION_STRING        = "AccountEndpoint=${azurerm_cosmosdb_account.cosmos_account.endpoint};AccountKey=${azurerm_cosmosdb_account.cosmos_account.primary_master_key};"
    GREETING                          = "Using terraform now"
    DEFAULT_REGION_AWS                = var.aws_region
    ACCESS_KEY_ID_AWS                 = var.aws_access_key
    SECRET_ACCESS_KEY_AWS             = var.aws_secret_key
    S3_BUCKET_ARN                     = aws_s3_bucket.bucket.arn
    S3_BUCKET_NAME                    = var.s3_bucket_name
    DYNAMO_TABLE_NAME                 = var.dynamo_table_name
    COSMOS_DATABASE                   = var.cosmos_database_name
    COSMOS_TABLE_NAME                 = var.cosmos_table_name
  }
}

# CosmosDB resources

resource "azurerm_cosmosdb_account" "cosmos_account" {
  name                = "${var.prefix}-${random_integer.random.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "cosmos_database" {
  name                = var.cosmos_database_name
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmos_account.name
  throughput          = 400
}

resource "azurerm_cosmosdb_sql_container" "cosmos_container" {
  name                = var.cosmos_table_name
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmos_account.name
  database_name       = azurerm_cosmosdb_sql_database.cosmos_database.name
  partition_key_path  = "/TransactionID"
  throughput          = 400
}


####### AWS ##############

# Specify the provider and access details
provider "aws" {
  region = var.aws_region
}

provider "archive" {}

data "archive_file" "zip" {
  type        = "zip"
  source_dir = "../node/symbiote"
  output_path = "symbiote.zip"
}

data "aws_iam_policy_document" "lambda-assume-role" {
  statement {
    actions = ["sts:AssumeRole"]
 
    principals {
      type = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name = "lambdaRole"
  assume_role_policy = data.aws_iam_policy_document.lambda-assume-role.json
}
 
data "aws_iam_policy_document" "cloudwatch-log-group-lambda" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
 
    resources = [
      "arn:aws:logs:*:*:*",
    ]
  }
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:PutItem",
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
      "dynamodb:DeleteItem"
    ]
 
    resources = [
      aws_dynamodb_table.table.arn,
    ]
  }
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:CreateBucket",
      "s3:DeleteBucket"
    ]
 
    resources = [
      aws_s3_bucket.bucket.arn,
      "${aws_s3_bucket.bucket.arn}/*"
    ]
  }
}

resource "aws_iam_role_policy" "lambda-cloudwatch-log-group" {
  name = "${aws_lambda_function.lambda.function_name}-log-group"
  role = aws_iam_role.lambda.name
  policy = data.aws_iam_policy_document.cloudwatch-log-group-lambda.json
}


resource "aws_cloudwatch_log_group" "loggroup" {
  name              = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
  retention_in_days = 14
}

resource "aws_s3_bucket" "bucket" {
  bucket = var.s3_bucket_name
  acl = "private"
  versioning {
    enabled = false
  }
  force_destroy = true
}

resource "aws_dynamodb_table" "table" {
  name = var.dynamo_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "TransactionID"

  attribute {
    name = "TransactionID"
    type = "S"
  }

   ttl {
    attribute_name = "TimeToExist"
    enabled        = false
  }
}

resource "aws_lambda_function" "lambda" {
  function_name    = var.lambda_function_name
  filename         = data.archive_file.zip.output_path
  source_code_hash = data.archive_file.zip.output_base64sha256
  memory_size      = var.lambda_memory_size
  role             = aws_iam_role.lambda.arn
  handler          = "main.handler"
  runtime          = var.lambda_runtime

  environment {
    variables = {
      GREETING = "Using terraform now"
      DEFAULT_REGION_AWS                = var.aws_region
      ACCESS_KEY_ID_AWS                 = var.aws_access_key
      SECRET_ACCESS_KEY_AWS             = var.aws_secret_key
      LOG_LEVEL                         = var.default_log_level
      S3_BUCKET_ARN                     = aws_s3_bucket.bucket.arn
      S3_BUCKET_NAME                    = var.s3_bucket_name
      DYNAMO_TABLE_NAME                 = var.dynamo_table_name
      STORAGE_CONNECTION_STRING         = azurerm_storage_account.storage.primary_connection_string
      OUTPUT_STORAGE_NAME               = "${var.prefix}${random_integer.random.result}"
      COSMOS_DATABASE                   = var.cosmos_database_name
      COSMOS_TABLE_NAME                 = var.cosmos_table_name
      COSMOSDB_CONNECTION_STRING        = "AccountEndpoint=${azurerm_cosmosdb_account.cosmos_account.endpoint};AccountKey=${azurerm_cosmosdb_account.cosmos_account.primary_master_key};"
    }
  }
}

# aws api gateway

resource "aws_api_gateway_rest_api" "api" {
  name = "ptx"
}   
  
resource "aws_api_gateway_resource" "resource" {
  path_part   = "ProcessTransaction"
  parent_id   = "${aws_api_gateway_rest_api.api.root_resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = "${aws_api_gateway_rest_api.api.id}"
  resource_id   = "${aws_api_gateway_resource.resource.id}"
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = "${aws_api_gateway_rest_api.api.id}"
  resource_id             = "${aws_api_gateway_resource.resource.id}"
  http_method             = "${aws_api_gateway_method.method.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.lambda.invoke_arn}"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.lambda.function_name}"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "lambda" {
  depends_on = [
    aws_api_gateway_integration.integration
  ]

  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  stage_name  = "api"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.lambda.function_name}"
  principal     = "apigateway.amazonaws.com"

  source_arn    = "${aws_api_gateway_deployment.lambda.execution_arn}/*/*"
}


##### OUTPUTS #####

# Output HTTPS endpoint for calling the function.
# NOTE: The function name after api/ must match the actual function name defined in the function folder.
output "function_endpoint" {
  value = "https://${azurerm_function_app.function.default_hostname}/api/ProcessTransaction"
}

output "lambda_endpoint" {
  value = "${aws_api_gateway_deployment.lambda.invoke_url}/ProcessTransaction"
}