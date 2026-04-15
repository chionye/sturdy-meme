const https = require('https');

const verifyPayment = (transactionId) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.flutterwave.com',
      port: 443,
      path: `/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          // Normalize to match existing controller checks:
          // controllers expect: result.status === 'success' and result.data.status === 'success'
          // Flutterwave returns: status === 'success' and data.status === 'successful'
          if (parsed.status === 'success' && parsed.data) {
            parsed.data.status = parsed.data.status === 'successful' ? 'success' : parsed.data.status;
            // Flutterwave amount is already in naira — keep as-is (controllers compare in naira)
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid Flutterwave response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

module.exports = { verifyPayment };
