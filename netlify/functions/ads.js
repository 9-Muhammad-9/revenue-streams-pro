const axios = require('axios');

exports.handler = async (event, context) => {
  const { userId, adType, value } = JSON.parse(event.body);
  
  // Calculate 30/70 split
  const userShare = value * 0.3;
  const platformShare = value * 0.7;
  
  // Update user balance and platform earnings
  await updateEarnings(userId, userShare, platformShare);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, userShare, platformShare })
  };
};
