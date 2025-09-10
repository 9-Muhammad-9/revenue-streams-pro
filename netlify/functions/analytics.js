exports.handler = async (event, context) => {
  const analytics = await getPlatformAnalytics();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      totalUsers: analytics.users,
      dailyRevenue: analytics.revenue,
      averageEarningsPerUser: analytics.avgEarnings
    })
  };
};
