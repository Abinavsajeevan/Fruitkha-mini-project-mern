## nodemailer-otp 

Nodemailer-otp  is a simple Node.js package that allows developers to easily generate OTPs (One Time Passwords) and send email notifications using Nodemailer. This package provides easy integration into your Node.js projects and supports customizable OTP lengths.

## Features
- Generate OTPs for use in your application
- Send OTPs and custom messages via email using Nodemailer
- Simple and customizable integration with your Node.js project
- Easy setup and usage

## Installation

To get started with `nodemon-helper`, follow these steps:

```bash
npm install nodemailer-otp 
```

Create a `.env` file in your project's root directory:

```plaintext
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-access-key
```

## Setup Instructions

### Email Provider Configuration

1. **Gmail Setup**:
   - Enable "Less Secure Apps" in your Gmail account settings, or
   - Generate an App-Specific Password if using 2-factor authentication
   - Use the app password in your `.env` file

2. **Dependencies**:
   ```bash
   npm install nodemailer
   ```

## Usage

### Basic Setup

```javascript
const NodemailerHelper = require('nodemailer-otp');
require('dotenv').config();

// Initialize the helper
const helper = new NodemailerHelper(process.env.EMAIL_USER, process.env.EMAIL_PASS);
```
### For (ESM) Syntax
```javascript
import NodemailerHelper from 'nodemailer-otp';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize the helper
const helper = new NodemailerHelper(process.env.EMAIL_USER, process.env.EMAIL_PASS);

```
### Generate OTP

```javascript
// Generate a 6-digit OTP
const otp = helper.generateOtp(6);
console.log(`Generated OTP: ${otp}`);
```

### Send OTP via Email

```javascript
helper.sendEmail('recipient-email@example.com','subject','your message here!', otp)
  .then((response ) => {
    console.log(response );
  })
  .catch((err) => {
    console.error(err);
  });
```

## API Reference

### `NodemailerHelper(email, emailAccessKey)`
Constructor for initializing the helper with your email credentials.

- `email`: Your email address
- `emailAccessKey`: Email provider access key or app-specific password

### `generateOtp(length)`
Generates an OTP.

- `length`: Number (4) //you can generate any length of otp. 
- Returns: String containing the generated OTP

### `sendOtp(recipientEmail, otp)`
Sends OTP via email.

- `recipientEmail`: Recipient's email address
- `otp`: OTP to send
- Returns: Promise
- 
## Troubleshooting

### Gmail Issues
- Verify "Less Secure Apps" is enabled or use App-Specific Password
- Confirm email credentials in `.env` file are correct

### OTP Generation Issues
- Check console logs for generated OTP is working

### Email Sending Issues
- Review error logs
- Verify email configuration in `.env`
- Check email service status and account restrictions

## Contributing

We welcome contributions! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
