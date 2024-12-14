# Screenshot Automation

This project automates the process of capturing screenshots of websites and uploading them to an AWS S3 bucket. It supports both local development and serverless deployment to AWS Lambda. 

Key features include:
- Support for **local development** using a custom Chromium installation.
- **Dynamic configuration** via `.env` files.
- Ability to specify the **URLs file** at runtime.
- **AWS Lambda-compatible** with configurable Chromium through a Lambda Layer.
- Scheduled execution via AWS EventBridge.

---

## Table of Contents
1. [Requirements](#requirements)
2. [Setup Instructions](#setup-instructions)
   - [Local Development](#local-development)
   - [AWS Lambda Deployment](#aws-lambda-deployment)
3. [Features](#features)
4. [Usage](#usage)
   - [Running Locally](#running-locally)
   - [Running in AWS Lambda](#running-in-aws-lambda)
5. [Environment Variables](#environment-variables)
6. [Using EventBridge to Trigger Lambda](#using-eventbridge-to-trigger-lambda)
7. [FAQ](#faq)

---

## Requirements
- Node.js (16.x or higher)
- AWS CLI installed and configured
- AWS Lambda (if deploying serverlessly)
- `npx` (bundled with Node.js)
- A valid S3 bucket in AWS

---

## Setup Instructions

### Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/screenshot-automation.git
   cd screenshot-automation
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Install Chromium**:
   Use `npx` to install a local Chromium binary compatible with Puppeteer:
   ```bash
   npx @puppeteer/browsers install chromium@latest --path /tmp/localChromium
   ```

   The output path for the Chromium binary will be needed for the `.env` file.

4. **Set Up `.env`**:
   Create a `.env` file in the root directory and configure:
   ```plaintext
   IS_LOCAL=true
   LOCAL_CHROMIUM=/tmp/localChromium/chromium/mac-1396327/chrome-mac/Chromium.app/Contents/MacOS/Chromium
   S3_BUCKET_NAME=your-s3-bucket-name
   AWS_REGION=us-east-1
   ```

5. **Add URL Files**:
   Define your list of websites in a file (e.g., `urls.json`) under `src/config`:
   ```json
   [
       {
           "url": "https://example.com",
           "websiteName": "Example Site"
       }
   ]
   ```

---

### AWS Lambda Deployment

1. **Prepare Lambda Layer**:
   - Download latest @sparticuz/chromium release from: https://github.com/Sparticuz/chromium/releases
   - Follow direction
   - Run:
     ```bash
     bucketName="chromiumUploadBucket" && \
aws s3 cp chromium-v131.0.1-layer.zip "s3://${bucketName}/chromiumLayers/chromium-v131.0.1-layer.zip" && \
aws lambda publish-layer-version --layer-name chromium --description "Chromium v131.0.1" --content "S3Bucket=${bucketName},S3Key=chromiumLayers/chromium-v131.0.1-layer.zip" --compatible-runtimes nodejs22.x --compatible-architectures x86_64
     ```
   - Upload the layer to AWS Lambda under **Layers**.
   - make sure runtime is compatable - nodejs22.x with lamba 

2. **Package the Lambda Function**:
   - From the project root:
     ```bash
     zip -r dist/lambda.zip . -x ".git/*" "dist/*" "logs/*" "screenshots/*" ".env"
     ```

   - Upload `dist/lambda.zip` to AWS Lambda as your function code.
      ```bash
      aws s3 mv dist/lambda.zip s3://ts-ecomm-screenshot/lambda-layer/lambda.zip
      ```

3. **Configure Lambda**:
   - Attach the Lambda Layer created above.
   - Add the required environment variables (see [Environment Variables](#environment-variables)).
   - Increase memory to 1536
   - Increase tinmeout to 5 min (to be adjusted based on number of URLs)
   - Under Runtime Settings, Set the handler to `lambda/handler.handler`.
   - Assign IAM permissions for S3 if new user AmazonS3FullAccess

4. **Test the Lambda Function**:
   - Use the AWS Lambda console to test or trigger the function via EventBridge (see [Using EventBridge](#using-eventbridge-to-trigger-lambda)).

---

## Features

### 1. **Run Locally or in AWS Lambda**
The project can dynamically switch between local development and AWS Lambda environments using environment variables.

### 2. **Dynamic URL Input**
The URLs file can be specified at runtime using the `--urls` flag:
```bash
node src/app.js --urls=urls.blogs.json
```
If no file is specified, it defaults to `urls.json`.

### 3. **Environment Configuration**
Configuration via `.env` allows flexibility without hardcoding sensitive details.

### 4. **Lambda-Compatible Chromium**
The Lambda Layer uses `@sparticuz/chromium` for headless browsing.

---

## Usage

### Running Locally
1. Ensure `.env` is set with `IS_LOCAL=true` and the correct `LOCAL_CHROMIUM` path.
2. Run the script:
   ```bash
   node src/app.js --urls=urls.blogs.json
   ```

### Running in AWS Lambda
1. Deploy the function and layer as described in [AWS Lambda Deployment](#aws-lambda-deployment).
2. Trigger the function via EventBridge or manually.

---

## Environment Variables

| Variable           | Description                                                                                  | Default          |
|--------------------|----------------------------------------------------------------------------------------------|------------------|
| `IS_LOCAL`         | Set to `true` for local development to use a local Chromium binary.                          | `false`          |
| `LOCAL_CHROMIUM`   | Path to the locally installed Chromium binary (e.g., `/tmp/localChromium/...`).              | `null`           |
| `S3_BUCKET_NAME`   | Name of the S3 bucket for uploading screenshots.                                             | `null`           |
| `AWS_REGION`       | AWS region for the S3 bucket and other services.                                             | `us-east-1`      |

---

## Using EventBridge to Trigger Lambda

1. **Set Up an EventBridge Rule**:
   - Create a rule to trigger the Lambda function on a schedule (e.g., daily).
   - Add a custom JSON payload to specify the `urls` file:
     ```json
     {
       "urls": "urls.blogs.json"
     }
     ```

2. **Update Lambda Code**:
   - Ensure the Lambda function reads the `urls` file name from the event payload.

3. **Monitor Execution**:
   - Check CloudWatch logs to confirm successful execution and troubleshoot issues.

---

## FAQ

### Why does the Chromium binary fail on Lambda?
Ensure you’re using `@sparticuz/chromium` in a Lambda Layer and not including it in your main function package.

### How can I debug issues locally?
Use the `IS_LOCAL=true` configuration to test with a local Chromium binary.

### How do I add more URLs to the script?
Create a new JSON file (e.g., `urls.new.json`) and specify it at runtime using the `--urls` flag or in the EventBridge payload.