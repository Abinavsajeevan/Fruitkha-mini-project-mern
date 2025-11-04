const transporter = require('./mailer');
const generateOrderPDF = require('./generateOrderPDF');
const fs = require('fs');

async function sendOrderPDFEmail(order, toEmail) {
  try {
    const pdfPath = await generateOrderPDF(order);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Your Order Confirmation - #${order._id}`,
      text: `Hi ${order.address.fullName},\n\nThank you for your order!\nYour order details are attached as a PDF.\n\n-Fruitkha Store`,
      attachments: [
        {
          filename: `Order_${order._id}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // Cleanup (delete temporary PDF)
    fs.unlinkSync(pdfPath);

    console.log('📦 Order confirmation email sent with PDF!');
  } catch (err) {
    console.error('❌ Failed to send order email with PDF:', err);
  }
}

module.exports = sendOrderPDFEmail;
