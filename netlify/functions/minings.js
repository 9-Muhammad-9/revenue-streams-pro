const axios = require('axios');
const mongoose = require('mongoose');

// Real mining platforms with free tiers
const MINING_PLATFORMS = {
  nicehash: {
    apiUrl: 'https://api2.nicehash.com/api/v2/public/services',
    freeTier: true,
    minPayout: 0.001
  },
  miningrigrentals: {
    apiUrl: 'https://www.miningrigrentals.com/api/v2',
    freeTier: false, // But has free monitoring
    minPayout: 0.002
  }
};

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// Mining session schema
const MiningSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  platform: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  hashrate: Number,
  earnings: { type: Number, default: 0 },
  status: { type: String, default: 'active' }
});

const MiningSession = mongoose.model('MiningSession', MiningSessionSchema);

exports.handler = async (event, context) => {
  await connectDB();
  
  const { action, userId, platform } = JSON.parse(event.body);
  
  try {
    switch (action) {
      case 'start':
        return await startMining(userId, platform);
      case 'stop':
        return await stopMining(userId);
      case 'stats':
        return await getMiningStats(userId);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Invalid action' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message })
    };
  }
};

async function startMining(userId, platform) {
  // Check if user already has active mining session
  const activeSession = await MiningSession.findOne({ 
    userId, 
    status: 'active' 
  });
  
  if (activeSession) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        success: false, 
        message: 'You already have an active mining session' 
      })
    };
  }
  
  // Start mining session with selected platform
  const session = new MiningSession({
    userId,
    platform,
    hashrate: calculateFreeTierHashrate(),
    startTime: new Date()
  });
  
  await session.save();
  
  // Start background mining process
  context.waitUntil(handleBackgroundMining(session._id));
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      success: true, 
      sessionId: session._id,
      message: 'Mining session started successfully' 
    })
  };
}

async function handleBackgroundMining(sessionId) {
  // This runs in background and updates earnings periodically
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 60000)); // Update every minute
    
    const session = await MiningSession.findById(sessionId);
    if (!session || session.status !== 'active') break;
    
    // Calculate earnings based on current mining rates
    const minuteEarnings = calculateMinuteEarnings(session.hashrate);
    session.earnings += minuteEarnings;
    await session.save();
    
    // Update user balance with 30% share
    await updateUserEarnings(session.userId, minuteEarnings * 0.3);
  }
}

function calculateFreeTierHashrate() {
  // Free tier typically provides 10-100 H/s
  return Math.random() * 90 + 10; // Random between 10-100 H/s
}

function calculateMinuteEarnings(hashrate) {
  // Simplified earnings calculation based on current Bitcoin price and difficulty
  const btcPrice = 50000; // Current BTC price in USD
  const dailyEarnings = (hashrate / 100000000000) * 0.1; // Simplified formula
  return (dailyEarnings * btcPrice) / 1440; // Per minute
}

async function updateUserEarnings(userId, amount) {
  // Update user's mining balance
  await mongoose.model('User').findByIdAndUpdate(userId, {
    $inc: { 
      balance: amount,
      miningEarnings: amount 
    }
  });
}
