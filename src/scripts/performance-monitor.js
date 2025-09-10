class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      adLoadTime: 0,
      functionResponseTime: 0,
      userActions: []
    };
    
    this.thresholds = {
      maxPageLoadTime: 3000,
      maxAdLoadTime: 2000,
      maxFunctionResponseTime: 1000
    };
  }
  
  trackPageLoad() {
    const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                    window.performance.timing.navigationStart;
    
    this.metrics.pageLoadTime = loadTime;
    
    if (loadTime > this.thresholds.maxPageLoadTime) {
      this.reportIssue('page_load_slow', { loadTime });
    }
  }
  
  trackAdLoad(adType, loadTime) {
    this.metrics.adLoadTime = loadTime;
    
    if (loadTime > this.thresholds.maxAdLoadTime) {
      this.reportIssue('ad_load_slow', { adType, loadTime });
    }
  }
  
  trackFunctionCall(functionName, responseTime) {
    this.metrics.functionResponseTime = responseTime;
    
    if (responseTime > this.thresholds.maxFunctionResponseTime) {
      this.reportIssue('function_response_slow', { functionName, responseTime });
    }
  }
  
  trackUserAction(action, details) {
    this.metrics.userActions.push({
      action,
      details,
      timestamp: Date.now()
    });
    
    // Log to analytics
    this.logToAnalytics(action, details);
  }
  
  reportIssue(issueType, data) {
    // Send to monitoring service
    fetch('/api/monitoring/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: issueType,
        data,
        timestamp: Date.now()
      })
    }).catch(console.error);
  }
  
  logToAnalytics(action, data) {
    // Send to analytics service
    console.log('Analytics event:', action, data);
  }
  
  getPerformanceReport() {
    return {
      ...this.metrics,
      issues: this.detectPerformanceIssues()
    };
  }
  
  detectPerformanceIssues() {
    const issues = [];
    
    if (this.metrics.pageLoadTime > this.thresholds.maxPageLoadTime) {
      issues.push('page_load_slow');
    }
    
    if (this.metrics.adLoadTime > this.thresholds.maxAdLoadTime) {
      issues.push('ad_load_slow');
    }
    
    return issues;
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();
window.addEventListener('load', () => performanceMonitor.trackPageLoad());

// Export for use in other scripts
window.PerformanceMonitor = performanceMonitor;
