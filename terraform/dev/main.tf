resource "aws_dynamodb_table" "users" {
  name         = "users-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  # chave primária
  attribute {
    name = "email"
    type = "S"
  }

  # atributo usado no GSI
  attribute {
    name = "cardId"
    type = "S"
  }

  global_secondary_index {
    name            = "cardId-index"
    hash_key        = "cardId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Name        = "users-${var.environment}"
    Environment = var.environment
  }

}

resource "aws_dynamodb_table" "admins" {
  name         = "admins-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "adminId"

  # Chave primária
  attribute {
    name = "adminId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Name        = "admins-${var.environment}"
    Environment = var.environment
  }
}