const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/send-estimate', upload.fields([
  { name: 'voidedCheck', maxCount: 1 },
  { name: 'driversLicense', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fundingAmount, term, payment } = req.body;
    const files = req.files;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const attachments = [];
    if (files['voidedCheck']) {
      attachments.push({
        filename: files['voidedCheck'][0].originalname,
        content: files['voidedCheck'][0].buffer
      });
    }
    if (files['driversLicense']) {
      attachments.push({
        filename: files['driversLicense'][0].originalname,
        content: files['driversLicense'][0].buffer
      });
    }

    const mailOptions = {
      from: `"EFS Estimate Form" <${process.env.EMAIL_USER}>`,
      to: 'info@enterprisefinestsolutions.com',
      subject: 'New Estimate Request',
      text: `Funding Amount: ${fundingAmount}\nTerm: ${term}\nPayment: ${payment}`,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: 'Estimate sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Error sending email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));