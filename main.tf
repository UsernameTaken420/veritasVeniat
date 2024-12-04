terraform {
	required_providers {
		aws = {
			source = "hashicorp/aws"
			version = "~> 5.0"
		}
	}
}

provider "aws" {
	region = "us-east-1"
}

data "external" "env" {
	program = ["${path.module}/env.sh"]
}

resource "aws_amplify_app" "veritasveniat" {
	name = "veritasveniat"
	repository = "https://github.com/UsernameTaken420/veritasVeniat"
	platform = "WEB"
	access_token = data.external.env.result["GH_TOKEN"]
	custom_rule {
		source = "/<*>"
		status = "404"
		target = "/404"
	}

	custom_rule {
		source = "https://veritasveniat.com"
		status = 302
		target = "https://blog.veritasveniat.com"
	}
	custom_rule {
		source = "https://www.veritasveniat.com"
		status = 302
		target = "https://blog.veritasveniat.com"
	}
	
	build_spec = <<-EOT
version: 1
frontend:
  phases:
    pre-build:
      commands:
        - wget https://github.com/gohugoio/hugo/releases/download/v${var.hugo-version}/hugo_extended_${var.hugo-version}_Linux-64bit.tar.gz
        - tar --overwrite -xf hugo_extended_${var.hugo-version}_Linux-64bit.tar.gz hugo
        - mv hugo /usr/bin/hugo
        - rm -rf hugo_extended_${var.hugo-version}_Linux-64bit.tar.gz
        - hugo version
    build:
      commands:
        - hugo
  artifacts:
    baseDirectory: public
    files:
      - "**/*"
  cache:
    paths: []	
	EOT
}

resource "aws_amplify_branch" "master" {
	app_id = aws_amplify_app.veritasveniat.id
	branch_name = "master"
	stage = "PRODUCTION"
	framework = "Hugo"
	enable_auto_build = true

	depends_on = [ resource.aws_amplify_app.veritasveniat ]
}

resource "time_sleep" "wait_40_seconds" {
	depends_on = [ resource.aws_amplify_app.veritasveniat ]
	create_duration = "40s"
}

resource "aws_amplify_domain_association" "domainAssociation" {
	app_id = aws_amplify_app.veritasveniat.id
	domain_name = "blog.veritasveniat.com"
	sub_domain {
		branch_name = aws_amplify_branch.master.branch_name
		prefix = ""
	}
}
