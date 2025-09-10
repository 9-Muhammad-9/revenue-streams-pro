class EarningsDashboard {
  constructor() {
    this.currentPeriod = 'month';
    this.earningsData = {
      ad: 0,
      mining: 0,
      referral: 0
    };
  }
  
  async init() {
    await this.loadEarningsData();
    this.renderDashboard();
    this.setupEventListeners();
  }
  
  async loadEarningsData() {
    try {
      const response = await fetch('/api/earnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'summary',
          userId: getCurrentUserId(),
          period: this.currentPeriod
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.earningsData = this.processEarningsData(data.summary);
        this.updateDashboard();
      }
    } catch (error) {
      console.error('Failed to load earnings data:', error);
    }
  }
  
  processEarningsData(summary) {
    const processed = { ad: 0, mining: 0, referral: 0 };
    
    summary.forEach(item => {
      processed[item._id] = item.totalAmount;
    });
    
    return processed;
  }
  
  renderDashboard() {
    const dashboard = document.createElement('div');
    dashboard.className = 'earnings-dashboard';
    dashboard.innerHTML = `
      <h3>Earnings Summary</h3>
      <div class="period-selector">
        <button class="period-btn active" data-period="day">Today</button>
        <button class="period-btn" data-period="week">Week</button>
        <button class="period-btn" data-period="month">Month</button>
        <button class="period-btn" data-period="year">Year</button>
      </div>
      <div class="earnings-breakdown">
        <div class="earnings-item">
          <span class="label">Ad Earnings:</span>
          <span class="amount" id="adEarnings">$0.00</span>
        </div>
        <div class="earnings-item">
          <span class="label">Mining Earnings:</span>
          <span class="amount" id="miningEarnings">$0.00</span>
        </div>
        <div class="earnings-item">
          <span class="label">Referral Earnings:</span>
          <span class="amount" id="referralEarnings">$0.00</span>
        </div>
        <div class="earnings-total">
          <span class="label">Total:</span>
          <span class="amount" id="totalEarnings">$0.00</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(dashboard);
  }
  
  updateDashboard() {
    document.getElementById('adEarnings').textContent = 
      `$${this.earningsData.ad.toFixed(2)}`;
    
    document.getElementById('miningEarnings').textContent = 
      `$${this.earningsData.mining.toFixed(2)}`;
    
    document.getElementById('referralEarnings').textContent = 
      `$${this.earningsData.referral.toFixed(2)}`;
    
    const total = this.earningsData.ad + this.earningsData.mining + this.earningsData.referral;
    document.getElementById('totalEarnings').textContent = `$${total.toFixed(2)}`;
  }
  
  setupEventListeners() {
    document.querySelectorAll('.period-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        document.querySelectorAll('.period-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        e.target.classList.add('active');
        this.currentPeriod = e.target.dataset.period;
        await this.loadEarningsData();
      });
    });
    
    // Refresh data every 5 minutes
    setInterval(() => this.loadEarningsData(), 300000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new EarningsDashboard();
  dashboard.init();
});
