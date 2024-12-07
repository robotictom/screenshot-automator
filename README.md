# Website Screenshot Automation

This project automates capturing screenshots of specified URLs using Puppeteer. By default, it saves screenshots locally, but it can optionally upload them to an AWS S3 bucket if run with a `--upload` flag. Browser dimensions are configurable and default to `1366x768` if not specified.

## Features
- Take screenshots using Puppeteer with configurable browser dimensions.
- Default dimensions (1366x768) can be overridden by values in `src/config/config.json`.
- Save screenshots locally by default.
- Optional S3 upload when run with `--upload`.
- Filenames include the chosen dimensions and timestamp:  
  `websiteName-widthxheight-timestamp.png`

---

## Prerequisites

### System Requirements
- **Node.js**: Version 16 or higher
- **npm**: Comes with Node.js
- **AWS CLI** (optional for local runs): For setting up AWS credentials

### Dependencies
- `puppeteer`: Controls headless Chrome for screenshots.
- `aws-sdk`: Interacts with AWS S3.
- `fs`, `path`: Node.js built-in modules for file operations and paths.

### AWS Configuration (for S3 upload)
1. **Create an S3 Bucket**:
   - Log in to the AWS Management Console.
   - Navigate to **S3** and create a new bucket (e.g. `my-screenshot-bucket`).
   - Note the bucket name for `src/config/config.json`.

2. **Set Up AWS Credentials**:
   - Run `aws configure` locally.
   - Provide your AWS Access Key ID, Secret Access Key, region, and output format.

3. **IAM Role for Lambda (Optional)**:
   - If deploying to Lambda, create an IAM role with permissions to access S3 and attach it to your Lambda function.

---

## Project Structure

```
.
├── src/
│   ├── config/
│   │   ├── config.json     # Global configuration (S3 bucket name, browser settings)
│   │   ├── urls.json       # List of URLs to capture
│   ├── services/
│   │   ├── screenshotService.js # Puppeteer logic
│   │   ├── s3Uploader.js        # S3 upload logic
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   ├── app.js                   # Entry point for local runs
├── lambda/
│   ├── handler.js               # AWS Lambda entry point
├── screenshots/                 # Local screenshots storage
├── package.json
└── README.md
```

---

## Configuration

### `src/config/config.json`
```json
{
    "s3BucketName": "your-s3-bucket-name",
    "browserWidth": 1600,
    "browserHeight": 900
}
```
- Omit `browserWidth` and `browserHeight` to use the default 1366x768.

### `src/config/urls.json`
```json
[
    { "url": "https://example.com", "websiteName": "example" },
    { "url": "https://example2.com", "websiteName": "example2" }
]
```

---

## Running the Script Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Without Uploading (Local Only)
```bash
node src/app.js
```
Screenshots will be saved in `screenshots/` directory.  
Files will be named like `example-1600x900-1699999999999.png`.

### 3. Run With Upload to S3
```bash
node src/app.js --upload
```
This uploads the screenshots to the S3 bucket specified in `config.json`.

---

## Deploying to AWS Lambda

### 1. Package the Project
```bash
zip -r lambda.zip lambda/ src/ node_modules/
```

### 2. Deploy to Lambda
- Upload `lambda.zip` via the AWS Lambda console.
- Set the handler to `lambda/handler.handler`.
- Assign an IAM role with appropriate permissions (e.g., S3 access).

### 3. Trigger the Lambda
- Run manually or schedule it using EventBridge (e.g., twice a week).

---

## Notes
- If you want to customize dimensions, edit `browserWidth` and `browserHeight` in `config.json`.
- If they’re not defined, the script defaults to `1366x768`.
- Check AWS credentials and IAM policies for proper S3 and Lambda access.
- Clean up old screenshots in S3 periodically to reduce storage costs.

---

## Troubleshooting
- **Missing AWS Credentials**: Ensure `aws configure` is set up or use IAM roles.
- **Dependency Issues on Lambda**: Use a Lambda-compatible Chromium if required.

---

## Future Enhancements
- Add retries for failed screenshots.
- Add notification on completion or failure.
- More granular IAM policies and parameterized environment variables.

---

## License
This project is open-source and available under the MIT License.