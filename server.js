const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Resend } = require('resend');
const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
const upload = multer();

// Initialize Resend with your API key
const resend = new Resend('re_DY9AvNU8_GzCi3B991bAUGMLLTovgz9c7'); // use your actual key securely in production

// Endpoint to receive estimate form data
app.post('/send-estimate', upload.fields([
  { name: 'voided_check', maxCount: 1 },
  { name: 'drivers_license', maxCount: 1 }
]), async (req, res) => {
  try {
    const { funding_amount, term_days, payment_per_day, factor, balance } = req.body;

    const voidedFile = req.files['voided_check']?.[0];
    const licenseFile = req.files['drivers_license']?.[0];

    const html = `
      <h3>New Estimate Request</h3>
      <p><strong>Funding Amount:</strong> $${funding_amount}</p>
      <p><strong>Term:</strong> ${term_days} Days</p>
      <p><strong>Daily Payment:</strong> $${payment_per_day}</p>
      <p><strong>Factor Rate:</strong> ${factor}</p>
      <p><strong>Balance:</strong> $${balance}</p>
    `;

    const attachments = [];

    if (voidedFile) {
      attachments.push({
        filename: voidedFile.originalname,
        content: voidedFile.buffer.toString('base64'),
        encoding: 'base64'
      });
    }

    if (licenseFile) {
      attachments.push({
        filename: licenseFile.originalname,
        content: licenseFile.buffer.toString('base64'),
        encoding: 'base64'
      });
    }

    const emailResponse = await resend.emails.send({
      from: 'info@enterprisefinestsolutions.com',
      to: 'info@enterprisefinestsolutions.com',
      subject: 'New Funding Estimate Request',
      html,
      attachments
    });

    console.log('Email sent:', emailResponse);
    res.status(200).send('OK');
  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Something went wrong.');
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
