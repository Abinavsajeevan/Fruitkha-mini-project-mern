const NodemailerHelper = require('nodemailer-otp');
const bcrypt = require('bcrypt')

const helper = new NodemailerHelper(process.env.EMAIL_USER, process.env.EMAIL_PASS);

async function sendOtpEmail(email) {
    const otp = helper.generateOtp(6);
    await helper.sendEmail(
        email,
        'Your verification OTP',
        'Use this OTP to verify your account ',
        otp
    );
    console.log('otp generated and sent', otp);
    hashedOtp = await bcrypt.hash(otp, 10)
    return hashedOtp;
}

module.exports = {sendOtpEmail}