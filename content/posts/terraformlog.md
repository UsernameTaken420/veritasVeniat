---
title: "Moving the blog's infrastructure to a Terraform file"
date: 2024-09-03T00:38:32-03:00
tags:
- Stack
- Meta
- Devops
---

Or "How I caused myself an outage lasting two entire days and the solution was to go way back"

<!--more-->

## Getting started
The first step to migrating the existing infrastructure to a Terraform configuration is to enumerate the existing services in use, in this case those are:
- AWS Amplify
- Route53|
## Amplify
We can get our current Amplify config by running `aws amplify list-apps`, which returns the following at the time of writing:
```json
{
    "apps": [
        {
            "appId": "d7nor59k0dnuf",
            "appArn": "arn:aws:amplify:us-east-1:054064245949:apps/d7nor59k0dnuf",
            "name": "veritasVeniat",
            "tags": {},
            "repository": "https://github.com/UsernameTaken420/veritasVeniat",
            "platform": "WEB",
            "createTime": "2023-01-26T22:37:24.621000-03:00",
            "updateTime": "2023-01-26T22:56:35.631000-03:00",
            "environmentVariables": {
                "_CUSTOM_IMAGE": "amplify:al2"
            },
            "defaultDomain": "d7nor59k0dnuf.amplifyapp.com",
            "enableBranchAutoBuild": false,
            "enableBranchAutoDeletion": false,
            "enableBasicAuth": false,
            "customRules": [
                {
                    "source": "https://veritasveniat.com",
                    "target": "https://www.veritasveniat.com",
                    "status": "302"
                },
                {
                    "source": "/<*>",
                    "target": "/index.html",
                    "status": "404-200"
                }
            ],
            "productionBranch": {
                "lastDeployTime": "2024-07-03T20:33:56.578000-03:00",
                "status": "SUCCEED",
                "branchName": "master"
            },
            "buildSpec": "version: 1\nfrontend:\n  phases:\n    build:\n      commands:\n        - hugo\n  artifacts:\n    baseDirectory: public\n    files:\n      - '**/*'\n  cache:\n    paths: []\n",
            "customHeaders": "",
            "enableAutoBranchCreation": false,
            "repositoryCloneMethod": "TOKEN"
        }
    ]
}
```

Dissecting this block, the following variables are out of our control given they're defined when the app is created:
- `appId`
- `appArn`
- `createTime` and `updateTime`
- `defaultDomain`
- `lastDeployTime` is updated as the repository for the app receives new commits and the app is updated to match

Porting everything else to a Terraform configuration nets us the following:
```terraform
resource "aws_amplify_app" "veritasveniat" {
	name = "veritasveniat"
	repository = "https://github.com/UsernameTaken420/veritasVeniat"
	platform = "WEB"

	custom_rule {
		source = "/<*>"
		status = "404-200"
		target = "/index.html"
	}

	custom_rule {
		source = "https://veritasveniat.com"
		status = 302
		target = "https://www.veritasveniat.com"
	}

	environment_variables = {
		ENV = "test"
		"_CUSTOM_IMAGE" = "amplify:al2"
	}
	build_spec = <<-EOT
	  version: 1
	  frontend:
  	    phases:
              build:
               commands:
                 - hugo
            artifacts:
              baseDirectory: public
              files:
                - '**/*'
            cache:
              paths: []
	EOT
}
```

## Route53
First let's make an inventory of our Hosted Zones with `aws route53 list-hosted-zones`
```json
{
    "HostedZones": [
        {
            "Id": "/hostedzone/Z037571824QZQP8EPCYRE",
            "Name": "veritasveniat.com.",
            "CallerReference": "RISWorkflow-RD:f98e522f-2162-44df-aa73-3e6c02f5e7aa",
            "Config": {
                "Comment": "HostedZone created by Route53 Registrar",
                "PrivateZone": false
            },
            "ResourceRecordSetCount": 5
        },
        {
            "Id": "/hostedzone/Z03738923J4OLEX8M45GG",
            "Name": "veritasveniat.com.",
            "CallerReference": "78855c8f-4eb6-4283-84c7-781d18ad4b6f",
            "Config": {
                "Comment": "",
                "PrivateZone": false
            },
            "ResourceRecordSetCount": 2
        }
    ]
}
```

Aside from this, we also must remember that we use a custom domain that is associated with Amplify, this takes us to the current state of the terraform file:
```terraform
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

resource "aws_amplify_app" "veritasveniat" {
	name = "veritasveniat"
	repository = "https://github.com/UsernameTaken420/veritasVeniat"
	platform = "WEB"
	access_token = [REDACTED]

	custom_rule {
		source = "/<*>"
		status = "200"
		target = "/index.html"
	}

	custom_rule {
		source = "https://veritasveniat.com"
		status = 302
		target = "https://www.veritasveniat.com"
	}

	environment_variables = {
		ENV = "test"
		"_CUSTOM_IMAGE" = "amplify:al2"
	}
	build_spec = <<-EOT
version: 1
frontend:
  phases:
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
}

resource "aws_amplify_domain_association" "domainAssociation" {
	app_id = aws_amplify_app.veritasveniat.id
	domain_name = "veritasveniat.com"

	# https://veritasveniat.com
	sub_domain {
		branch_name = aws_amplify_branch.master.branch_name
		prefix = ""
	}
	# https://www.veritasveniat.com
	sub_domain {
		branch_name = aws_amplify_branch.master.branch_name
		prefix = "www"
	}
}
```

And now for the test of fire... manually deleting the existing app and checking it kicks up correctly. Frankly, I'm half scared to death it's not gonna work and I'll have to ClickOps my way back into functionality.

Addendum: had to add the following `custom_rule` to make the 404 page behave correctly:
```terraform
custom_rule {
	source = "/<*>"
	status = "404"
	target = "/404"
}
```

## Troubles
It wasn't so easy after all! As soon as we run `terraform apply` we're hit with an error after some 20 seconds of running:
```
Error: waiting for Amplify Domain Association (d3oq0ofmdltzio/veritasveniat.com) verification: unexpected state 'AWAITING_APP_CNAME', wanted target 'PENDING_DEPLOYMENT, AVAILABLE'. last error: %!s(<nil>)
│
│   with aws_amplify_domain_association.domainAssociation,
│   on main.tf line 63, in resource "aws_amplify_domain_association" "domainAssociation":
│   63: resource "aws_amplify_domain_association" "domainAssociation" {
```

This can be quickly fixed by adding `depends_on = [ resource.aws_amplify_app.veritasveniat ]` to the amplify domain association.

However, the app *is* up and running on AWS, just... not actually deploying at all? Seems the `master` branch is not actually set up as the production branch for the application.

After manually setting up the production branch to `master` and running a deployment we see the site actually builds and deploys just fine, until you actually check what it looks like, at least.

To remedy the production branch problem, we edit the `aws_amplify_branch` resource to:
```
resource "aws_amplify_branch" "master" {
	app_id = aws_amplify_app.veritasveniat.id
	branch_name = "master"
	stage = "PRODUCTION"
	framework = "Hugo"
}
```

Seems that apparently now there's a native Github App for Amplify for us to use instead of OAuth and we're prompted for a migration. A prompt mentioning the deletion of any old webhooks and the addition of the Github App's is shown, but luckily for us we have no active webhooks on our app! (we can check with `aws amplify list-webhooks --app-id [appId]`)

### What the scss?
Our new problem is not being able actually finish deploying due to the following error:
```
2024-09-02T18:27:31.987Z [WARNING]: Error: Error building site: TOCSS: failed to transform "scss/fuji.scss" (text/x-scss): resource "scss/scss/fuji.scss_c63600327b20d2d8975b827d4bd1220e" not found in file cache
```

Most google results point to this being an issue with either the image in use not having the correct version of Go installed or using a non-Extended version of Hugo. 
As it turns out, the problem was us all along! The original version of the site was built with the image `"amplify:al2"`, so by removing that from the environment variables, the site now builds with the default version of Amazon Linux 2023.

## The final file
Here's the final code that is deployed *right now*:

`variables.tf`:
```terraform
variable "hugo-version" {
    type = string
    default = "v0.133.1"
}
```

`main.tf`:
```terraform
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

resource "aws_amplify_app" "veritasveniat" {
	name = "veritasveniat"
	repository = "https://github.com/UsernameTaken420/veritasVeniat"
	platform = "WEB"
	access_token = "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"

	custom_rule {
		source = "/<*>"
		status = "404"
		target = "/404"
	}

	custom_rule {
		source = "https://veritasveniat.com"
		status = 302
		target = "https://www.veritasveniat.com"
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
	domain_name = "veritasveniat.com"

	# https://veritasveniat.com
	sub_domain {
		branch_name = aws_amplify_branch.master.branch_name
		prefix = ""
	}
	# https://www.veritasveniat.com
	sub_domain {
		branch_name = aws_amplify_branch.master.branch_name
		prefix = "www"
	}

	depends_on = [ resource.time_sleep.wait_40_seconds ]
}
```
