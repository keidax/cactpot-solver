terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "keidax-tf-data"
    key            = "app/cactpot-solver"
    region         = "us-east-2"
    dynamodb_table = "terraform-state-locks"
  }
}

provider "aws" {
  region = "us-east-2"
}

provider "aws" {
  alias  = "east1"
  region = "us-east-1"
}

locals {
  app_name    = "cactpot-solver"
  origin_name = "${local.app_name}-s3-origin"
  domain_name = "minicactpotsolver.xyz"
}

resource "aws_s3_bucket" "site_content" {
  bucket = "${local.app_name}-site-content"
}

resource "aws_s3_bucket_versioning" "site_content_versioning" {
  bucket = aws_s3_bucket.site_content.id
  versioning_configuration {
    status = "Enabled"
  }
}

data "aws_iam_policy_document" "allow_cloudfront_access_to_bucket" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site_content.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site_distribution.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "allow_cloudfront_access_to_bucket" {
  bucket = aws_s3_bucket.site_content.id
  policy = data.aws_iam_policy_document.allow_cloudfront_access_to_bucket.json
}

resource "aws_cloudfront_origin_access_control" "site_oac" {
  name                              = "${local.app_name}-s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "cache_policy_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_distribution" "site_distribution" {
  origin {
    domain_name              = aws_s3_bucket.site_content.bucket_regional_domain_name
    origin_id                = local.origin_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site_oac.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = [local.domain_name]

  price_class = "PriceClass_All"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.origin_name
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.cache_policy_optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate_validation.cert.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_acm_certificate" "cert" {
  provider          = aws.east1
  domain_name       = local.domain_name
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cert" {
  provider        = aws.east1
  certificate_arn = aws_acm_certificate.cert.arn
}

output "domain_validation" {
  value = aws_acm_certificate.cert.domain_validation_options
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.site_distribution.domain_name
}
