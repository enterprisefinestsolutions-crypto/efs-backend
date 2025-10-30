const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/send-estimate', async (req, res) => {
  try {
    const { funding_amount, term_days, payment_per_day, factor, balance } = req.body;

    const emailResponse = await resend.emails.send({
      from: 'onboarding@resend.dev', // ✅ Default sender — no domain setup required
      to: 'info@enterprisefinestsolutions.com',
      subject: 'New Estimate Submission',
      text: `
New funding estimate received:

Funding Amount: $${funding_amount}
Term: ${term_days} days
Payment per Day: $${payment_per_day}
Factor: ${factor}
Balance: $${balance}
      `
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return res.status(500).json({ success: false, message: emailResponse.error.message });
    }

    console.log('Email sent successfully via Resend');
    res.status(200).json({ success: true, message: 'Estimate sent successfully!' });

  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
