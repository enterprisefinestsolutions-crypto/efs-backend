const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const { Resend } = require('resend');

const app = express();
const port = process.env.PORT || 10000;
const upload = multer();

// Initialize Resend with your API Key
const resend = new Resend('re_DY9AvNU8_GzCi3B991bAUGMLLTovgz9c7');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-estimate', upload.fields([
  { name: 'voided_check', maxCount: 1 },
  { name: 'drivers_license', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      funding_amount,
      term_days,
      payment_per_day,
      factor,
      balance
    } = req.body;

    // Optional: you can log this to verify data
    console.log('Received:', req.body);

    const htmlContent = `
      <h2>New Funding Estimate Request</h2>
      <ul>
        <li><strong>Funding Amount:</strong> $${funding_amount}</li>
        <li><strong>Term:</strong> ${term_days} days</li>
        <li><strong>Payment per Day:</strong> $${payment_per_day}</li>
        <li><strong>Factor Rate:</strong> ${factor}</li>
        <li><strong>Balance:</strong> $${balance}</li>
      </ul>
    `;

    const response = await resend.emails.send({
      from: 'info@enterprisefinestsolutions.com',
      to: 'info@enterprisefinestsolutions.com',
      subject: 'Estimate Request from Website',
      html: htmlContent
    });

    console.log('Email sent:', response);
    res.status(200).json({ message: 'Estimate sent successfully!' });

  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Default route (optional)
app.get('/', (req, res) => {
  res.send('EFS Email Backend is running');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
