const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const upload = multer(); // Use memory storage

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resend = new Resend(process.env.RESEND_API_KEY);

// POST endpoint
app.post('/send-estimate', upload.fields([
  { name: 'voided_check', maxCount: 1 },
  { name: 'drivers_license', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      funding_amount = 'N/A',
      term_days = 'N/A',
      payment_per_day = 'N/A',
      factor = 'N/A',
      balance = 'N/A'
    } = req.body || {};

    if (!req.body) {
      throw new Error('Missing form fields (req.body is undefined)');
    }

    const voidedCheck = req.files?.voided_check?.[0];
    const driversLicense = req.files?.drivers_license?.[0];

    if (!voidedCheck || !driversLicense) {
      return res.status(400).json({ error: 'Both attachments are required' });
    }

    const html = `
      <h3>New Estimate Submission</h3>
      <p><strong>Funding Amount:</strong> $${funding_amount}</p>
      <p><strong>Term:</strong> ${term_days} days</p>
      <p><strong>Daily Payment:</strong> $${payment_per_day}</p>
      <p><strong>Factor Rate:</strong> ${factor}</p>
      <p><strong>Balance:</strong> $${balance}</p>
    `;

    const email = await resend.emails.send({
      from: 'EFS Calculator <noreply@enterprisefinestsolutions.com>',
      to: ['info@enterprisefinestsolutions.com'],
      subject: 'New Estimate Submitted',
      html,
      attachments: [
        {
          filename: voidedCheck.originalname,
          content: voidedCheck.buffer
        },
        {
          filename: driversLicense.originalname,
          content: driversLicense.buffer
        }
      ]
    });

    return res.status(200).json({ success: true, messageId: email.id });
  } catch (err) {
    console.error('SERVER ERROR:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
