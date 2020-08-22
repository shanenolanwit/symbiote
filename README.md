# symbiote

> Noun. an organism in a partnership with another such that each profits from their being together.

![Symbiotic Spiderman](./website/symbiote.png?raw=true "symbiotic spiderman")


- [About](#about)
- [Prerequisites](#prerequisites)
- [Terraform](#terraform)
- [API](#api)
  * [Execute a function](#execute-a-function)
  * [Write to a database](#write-to-a-database)
  * [Read from a database](#read-from-a-database)
  * [Write to file storage](#write-to-file-storage)
  * [Read from file storage](#read-from-file-storage)
- [Local Scripts](#local-scripts)
- [Website](#website)
- [Dependencies](#dependencies)
  * [symbiote](#symbiote)
  * [local scripts](#local-scripts)
  * [website CDNs](#website-cdns)
  
## About 
***symbiote*** is used to combine the *AWS* and *Azure* cloud platforms, to enable and simplify multi cloud high availability. It also allows consumers fine tune their applications performance by allowing them to easily route requests through optimal configuration paths for any given operation. The ***symbiote*** application adapts to its environment to provide an identical and seamless experience regardless of where it is invoked - be it *AWS Lambda*, *Azure Function* or even locally.

## Prerequisites
- An AWS Account with Valid Developer Access Keys*
- The AWS CLI installed
- An Azure Account with a Valid Developer Account*
- The Azure CLI installed
- Terraform v0.12.23 installed
- NodeJS v10.15.3 installed

\* developer meaning a role that can create the following resources

AWS
- AWS IAM Policy Document
- AWS IAM Role
- AWS Lambda Function
- AWS CloudWatch LogGroup
- AWS S3 Bucket
- AWS Dynamo Table
- AWS Dynamo Table
- AWS Api Gateway

Azure
- Azure Storage Account
- Azure Storage Container
- Azure Storage Blob
- Azure Service Plan
- Azure Function App
- Azure HTTP Trigger
- Azure Cosmos Account
- Azure Cosmos Database
- Azure Cosmos Container

Before moving onto terraform, add the appropriate credentials to the bash session.  
*Add Azure credentials to the session*
```
az login
```
*Add AWS credentials to the session*
```
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_DEFAULT_REGION=eu-west-1
```
Note that the Azure login is an interactive login. For alternative options, see [here](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli?view=azure-cli-latest)

## Terraform 

Rename the `terraform/variables.template` file to `variables.tf`  
```
mv terraform/variables.template terraform/variables.tf
```
Update the variables to suit your requirements
```json
"default_log_level": DEBUG|INFO|ERROR
"aws_region": the aws region of your aws account
"aws_access_key": aws access key
"aws_secret_key": aws secret access key
"symbiote_lambda": DEPRECATED - can leave blank for now
"lambda_function_name": what to name the aws lambda function
"lambda_runtime": lambda runtime. tested with Node 10
"lambda_memory_size": amount of memory to allocate to the lambda
"s3_bucket_name": name of the aws s3 bucket and azure storage container
"dynamo_table_name": name of the aws dynamo table
"cosmos_database_name": name of the azure cosmos database
"cosmos_table_name": name of the azure cosmos database table
```

Review the dependencies list and once happy, install the node modules for the function to be deployed to aws and azure
```
cd node/symbiote
cat package.json
npm i
cd ../../terraform
```
Run the terraform `init` command to initialise all the required modules
```
terraform init
```
Run the terraform `plan` command
```
terraform plan
```
Review the resources to be created and once happy, run the terraform `apply` command and follow on screen prompts (script will asked for confirmation to create)
```
terraform apply
```
Once the script has finished running two outputs will be displayed
```
function_endpoint: the http entry point for the deployed Azure Function
lambda_endpoint: the http entry point for the deployed AWS Lambda
```

## API
The API is invoked via http calls to either the function_endpoint or lambda_endpoint 
provided by the terraform script output. The general format of the payloads is as follows:
* **provider** - all payloads will contain this key, the value will be either *aws* or *azure*, this specifies which platform is the primary provider (ie which platform to write to or read from first). In the website, this value also decides which platform to direct http calls to.
* **service** - all payloads will contain this key. Valid values are 
  - **fn** this denotes that the service to be invoked is the function service, for AWS this is AWS Lambda, for Azure this is Azure Function 
  - **db** this denotes that the service to be invoked is the database service, for AWS this is AWS DynamoDB, for Azure this is Azure DynamoDB 
  - **io** this denotes that the service to be invoked is the file io service, for AWS this is 
  AWS S3, for Azure this is Azure Storage
* **action** - all payloads will contain this key, when service is set to *fn*, the only valid action is *execute*, when service is set to *db* or *io*, the valid actions are *read* or *write*
* **transactionID** - all payloads will contain this, this can be used for tracking performance in local scripts and as an identifier in both the database and file storage services. When the service is set to **db** or **io** this transactionID will be the key in a database row or the name of a file in file storage depending on the service which is invoked.
* **strategy** - all payloads will contain this, main use case is for tracking performance, simple string representing the configuration being used or the purpose of the invoke
* **duplicate** - only relevant for db writes or io writes, this flag will determine if records are written to both primary and secondary storage or to primary storage only. Valid values are *true* or *false*


The following payloads can be used to provide various operations and can 
be sent to either the function or lambda endpoint
### Execute a function
```json
{
  "provider": "aws",                    // Primary Provider - valid values are "aws" or "azure"
  "service": "fn",                      // References the function service 
  "action": "execute",                  // Action to perform
  "transactionID": "abc123",            // Execution Reference
  "strategy": "demo"                    // Configuration Reference
}
```
### Write to a database
```json
{
  "provider": "azure",          // Primary Provider
  "service": "db",              // References the database service 
  "action": "write",            // Action to perform
  "transactionID": "xyz123",    // Execution Reference & primary key in the database
  "strategy": "demo",           // Configuration Reference
  "duplicate": "true",          // Determines if data will be written to both platforms.
  "message": "hello world"      // data to be stored in the message column of the database
}
```
### Read from a database
```json
{
  "provider": "azure",          // Primary Provider
  "service": "db",              // References the database service 
  "action": "read",             // Action to perform
  "transactionID": "xyz123",    // Execution Reference & primary key in the database
  "strategy": "demo",           // Configuration Reference
}
```
### Write to file storage
```json
{
  "provider": "aws",            // Primary Provider
  "service": "io",              // References the database service 
  "action": "write",            // Action to perform
  "transactionID": "xyz123",    // Execution Reference & file name
  "strategy": "demo",           // Configuration Reference
  "duplicate": "true",          // Determines if data will be written to both platforms. 
  "message": "hello world"      // data to be stored in the message key of the json payload saved to file
}
```
### Read from file storage
```json
{
  "provider": "azure",          // Primary Provider
  "service": "io",              // References the database service 
  "action": "read",             // Action to perform
  "transactionID": "xyz123",    // Execution Reference & file name
  "strategy": "demo",           // Configuration Reference
}
```
## Local Scripts
Local scripts can be used to send synthetic traffic through the configured entry points. 

Install the dependencies for the local scripts
```
cd scripts
npm i
```
Rename the `.envtemplate` file to `.env`
```
mv .envtemplate .env
```
Modify the `.env` file to match your development environment (for example using the output values provided by your terraform script)
```
LAMBDA_ENDPOINT=
FUNCTION_ENDPOINT=
```
The `runner` script contains code for building payloads of various types. There is code commented out that is a sample of how to test io reads for example. Modify this code to suit your own testing requirements. Run the code when required by running the following command
```
node runner.js
```
The `directInvoker` script can be used to test lambda invokes. Configure the endpoints and the 
time, and update payloads to suit your own function. This example was testing functions requiring a single *name* parameter. Run the code when required by running the following command
```
node directInvoker.js
```

## Website

The website provided is a single HTML file which includes external cdn dependencies as well as custom css and javascript. To make this website work for your development environment, update the 
entry points listed in the `sendRequest` function to match your own AWS and Azure functions.

## Dependencies
Node dependencies are listed in the `package.json` file
### symbiote
```json
{
  "@azure/abort-controller": "^1.0.1",
  "@azure/cosmos": "^3.7.4",
  "@azure/storage-blob": "^12.2.0-preview.1",
  "aws-sdk": "^2.717.0",
  "loglevel": "^1.6.8"
}
```
### local scripts
```json
{
  "aws-sdk": "^2.717.0",
  "dotenv": "^8.2.0",
  "fs": "0.0.1-security",
  "loglevel": "^1.6.8",
  "node-fetch": "^2.6.0",
  "shortid": "^2.2.15",
  "@azure/abort-controller": "^1.0.1",
  "@azure/cosmos": "^3.7.4",
  "@azure/storage-blob": "^12.2.0-preview.1"
}
```
### website CDNs
The website uses CDN to load its dependencies which are listed here for completeness
#### CSS
```
https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css
```
#### Javascript
```
https://code.jquery.com/jquery-3.3.1.min.js
https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js
https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js
https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.3/ace.js
   
```

