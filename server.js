const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const emailResponse = await resend.emails.send({
      from: 'EFS Estimate <info@enterprisefinestsolutions.com>',
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
          content: voidedCheckFile.buffer.toString('base64'),
        },
        {
          filename: driversLicenseFile.originalname,
          content: driversLicenseFile.buffer.toString('base64'),
        }
      ]
    });

    if (emailResponse.error) {
      throw new Error(emailResponse.error.message);
    }

    res.status(200).json({ success: true, message: 'Estimate sent successfully via Resend.' });

  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ success: false, message: 'Failed to send via Resend.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
