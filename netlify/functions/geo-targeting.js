const axios = require('axios');

exports.handler = async (event, context) => {
  const { ip } = JSON.parse(event.body);
  
  try {
    // Get user location from IP
    const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
    const geoData = geoResponse.data;
    
    // Define CPM rates by country tier
    const countryTiers = {
      tier1: ['US', 'UK', 'CA', 'AU', 'DE', 'FR'], // High CPM
      tier2: ['JP', 'KR', 'SG', 'NZ', 'IE'], // Medium CPM
      tier3: ['BR', 'RU', 'CN', 'IN', 'MX'] // Lower CPM
    };
    
    // Determine tier and appropriate CPM
    let tier = 'tier3';
    if (countryTiers.tier1.includes(geoData.countryCode)) {
      tier = 'tier1';
    } else if (countryTiers.tier2.includes(geoData.countryCode)) {
      tier = 'tier2';
    }
    
    // CPM rates by tier
    const cpmRates = {
      tier1: 2.5,
      tier2: 1.2,
      tier3: 0.4
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        country: geoData.country,
        countryCode: geoData.countryCode,
        tier,
        cpmRate: cpmRates[tier],
        currency: 'USD'
      })
    };
  } catch (error) {
    // Fallback to default rates
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        country: 'Unknown',
        countryCode: 'US',
        tier: 'tier1',
        cpmRate: 2.5,
        currency: 'USD'
      })
    };
  }
};
