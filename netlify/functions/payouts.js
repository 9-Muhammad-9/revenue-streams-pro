const paypal = require('@paypal/checkout-server-sdk');

exports.handler = async (event, context) => {
  const { userId, amount, paypalEmail } = JSON.parse(event.body);
  
  // Process PayPal payout
  const payoutResponse = await processPayPalPayout(paypalEmail, amount);
  
  if (payoutResponse.success) {
    // Update user balance
    await deductUserBalance(userId, amount);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, transactionId: payoutResponse.id })
    };
  }
  
  return {
    statusCode: 500,
    body: JSON.stringify({ success: false, error: payoutResponse.error })
  };
};
