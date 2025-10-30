const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Use memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Handle form submission
app.post('/send-estimate', upload.fields([
  { name: 'voided_check', maxCount: 1 },
  { name: 'drivers_license', maxCount: 1 }
]), async (req, res) => {
  try {
    const { funding_amount, term_days, payment_per_day, factor, balance } = req.body;

    const voidedCheckFile = req.files['voided_check']?.[0];
    const driversLicenseFile = req.files['drivers_license']?.[0];

    if (!voidedCheckFile || !driversLicenseFile) {
      return res.status(400).json({ error: 'Missing file(s)' });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"EFS Estimate" <${process.env.EMAIL_USER}>`,
      to: 'info@enterprisefinestsolutions.com',
      subject: 'New Estimate Submission',
      text: `
New funding estimate received:

Funding Amount: $${funding_amount}
Term: ${term_days} days
Payment per Day: $${payment_per_day}
Factor: ${factor}
Balance: $${balance}
      `,
      attachments: [
        {
          filename: voidedCheckFile.originalname,
          content: voidedCheckFile.buffer
        },
        {
          filename: driversLicenseFile.originalname,
          content: driversLicenseFile.buffer
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Estimate sent successfully!' });

  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// ✅ Use dynamic port for Render (critical!)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
