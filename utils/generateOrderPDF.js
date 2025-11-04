const ejs = require('ejs');
const path = require('path');
const pdf = require('html-pdf');

async function generateOrderPDF(order) {
    const ejsPath = path.join(__dirname,'../views/user/orderConfirmation.ejs');
    const html = await ejs.renderFile(ejsPath, { order });
    const pdfPath = path.join(__dirname, `../temp/order_${order._id}.pdf`);

    return new Promise((resolve, reject) => {
        pdf.create(html, {format: 'A4', border: '10mm' }).toFile(pdfPath, (err, res) => {
            if(err) return reject(err);
            resolve(pdfPath)
        })
    })
}

module.exports = generateOrderPDF;