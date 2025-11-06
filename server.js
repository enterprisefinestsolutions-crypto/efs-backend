const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Resend } = require('resend');
const app = express();
const port = process.env.PORT || 10000;

// ✅ Use CORS — allow your frontend origin
app.use(cors({
  origin: 'https://enterprisefinestsolutions.com',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

// ✅ Configure file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Load Resend
const resend = new Resend('re_DY9AvNU8_GzCi3B991bAUGMLLTovgz9c7'); // Replace with your real key if different

// ✅ API endpoint
app.post('/send-estimate', upload.fields([
  { name: 'voided_check', maxCount: 1 },
  { name: 'drivers_license', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    // Required fields check
    if (!data.funding_amount || !data.term_days || !data.payment_per_day || !files?.voided_check || !files?.drivers_license) {
      return res.status(400).send('Missing required data or files');
    }

    const attachments = [
      {
        filename: 'voided_check.pdf',
        content: files.voided_check[0].buffer.toString('base64'),
        encoding: 'base64'
      },
      {
        filename: 'drivers_license.pdf',
        content: files.drivers_license[0].buffer.toString('base64'),
        encoding: 'base64'
      }
    ];

    const html = `
      <h2>New Estimate Request</h2>
      <ul>
        <li><strong>Funding Amount:</strong> $${data.funding_amount}</li>
        <li><strong>Term (days):</strong> ${data.term_days}</li>
        <li><strong>Payment per Day:</strong> $${data.payment_per_day}</li>
        <li><strong>Factor Rate:</strong> ${data.factor}</li>
        <li><strong>Balance:</strong> $${data.balance}</li>
      </ul>
    `;

    const email = await resend.emails.send({
      from: 'EFS Calculator <info@enterprisefinestsolutions.com>',
      to: ['info@enterprisefinestsolutions.com'],
      subject: 'New Estimate Request Submitted',
      html,
      attachments
    });

    console.log('Resend Email Sent:', email.id || email);
    res.status(200).send('Email sent');
  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Something went wrong');
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
