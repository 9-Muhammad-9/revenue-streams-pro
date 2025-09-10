const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// Earnings tracking schema
const EarningsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['ad', 'mining', 'referral'] },
  amount: { type: Number, required: true },
  details: mongoose.Schema.Types.Mixed
});

const Earnings = mongoose.model('Earnings', EarningsSchema);

exports.handler = async (event, context) => {
  await connectDB();
  
  const { action, data } = JSON.parse(event.body);
  
  try {
    switch (action) {
      case 'log':
        return await logEarning(data);
      case 'get':
        return await getEarnings(data);
      case 'summary':
        return await getEarningsSummary(data);
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

async function logEarning(data) {
  const earning = new Earnings(data);
  await earning.save();
  
  // Update user's total balance
  await mongoose.model('User').findByIdAndUpdate(data.userId, {
    $inc: { balance: data.amount }
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, earning })
  };
}

async function getEarnings({ userId, limit = 50, offset = 0 }) {
  const earnings = await Earnings.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .skip(offset);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, earnings })
  };
}

async function getEarningsSummary({ userId, period = 'month' }) {
  const startDate = getPeriodStartDate(period);
  
  const summary = await Earnings.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, summary })
  };
}

function getPeriodStartDate(period) {
  const now = new Date();
  
  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return new Date(0); // All time
  }
}
