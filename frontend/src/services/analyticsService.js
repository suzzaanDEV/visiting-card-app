class AnalyticsService {
  constructor() {
    this.baseURL = '/api/analytics';
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get user agent and device info
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
    
    let deviceType = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    return {
      userAgent,
      deviceType,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language
    };
  }

  // Track page view
  async trackPageView(pageUrl, cardId = null) {
    try {
      const deviceInfo = this.getDeviceInfo();
      const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);

      const payload = {
        cardId,
        actionType: 'view',
        metadata: {
          userAgent: deviceInfo.userAgent,
          deviceType: deviceInfo.deviceType,
          pageUrl,
          sessionId: this.sessionId,
          timeSpent,
          screenWidth: deviceInfo.screenWidth,
          screenHeight: deviceInfo.screenHeight,
          language: deviceInfo.language
        }
      };

      await this.sendAnalytics(payload);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track card interaction
  async trackCardInteraction(cardId, actionType, additionalData = {}) {
    try {
      const deviceInfo = this.getDeviceInfo();
      const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);

      const payload = {
        cardId,
        actionType,
        metadata: {
          userAgent: deviceInfo.userAgent,
          deviceType: deviceInfo.deviceType,
          sessionId: this.sessionId,
          timeSpent,
          interactionDepth: additionalData.interactionDepth || 1,
          ...additionalData
        }
      };

      await this.sendAnalytics(payload);
    } catch (error) {
      console.error('Error tracking card interaction:', error);
    }
  }

  // Track love/unlove
  async trackLove(cardId, isLoved) {
    await this.trackCardInteraction(cardId, isLoved ? 'love' : 'unlove');
  }

  // Track share
  async trackShare(cardId, shareMethod = 'link') {
    await this.trackCardInteraction(cardId, 'share', { shareMethod });
  }

  // Track download
  async trackDownload(cardId, downloadType = 'png') {
    await this.trackCardInteraction(cardId, 'download', { downloadType });
  }

  // Track QR scan
  async trackQRScan(cardId) {
    await this.trackCardInteraction(cardId, 'qr_scan');
  }

  // Track link click
  async trackLinkClick(cardId, linkType) {
    await this.trackCardInteraction(cardId, 'link_click', { linkType });
  }

  // Track save to device
  async trackSave(cardId) {
    await this.trackCardInteraction(cardId, 'save');
  }

  // Send analytics data to backend
  async sendAnalytics(payload) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/track`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Analytics tracking failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending analytics:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  // Get card analytics
  async getCardAnalytics(cardId, period = '30d') {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${this.baseURL}/card/${cardId}?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching card analytics:', error);
      throw error;
    }
  }

  // Get user engagement analytics
  async getUserEngagement(userId, period = '30d') {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${this.baseURL}/user/${userId}?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user engagement: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user engagement:', error);
      throw error;
    }
  }

  // Get trending cards
  async getTrendingCards(limit = 10, period = '7d') {
    try {
      const response = await fetch(`${this.baseURL}/trending?limit=${limit}&period=${period}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trending cards: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trending cards:', error);
      throw error;
    }
  }

  // Get system analytics (admin only)
  async getSystemAnalytics(period = '30d') {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${this.baseURL}/system?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch system analytics: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics(cardId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${this.baseURL}/realtime/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch real-time analytics: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      throw error;
    }
  }

  // Get engagement insights
  async getEngagementInsights(cardId, period = '30d') {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${this.baseURL}/insights/${cardId}?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch engagement insights: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching engagement insights:', error);
      throw error;
    }
  }

  // Export analytics report
  async exportAnalyticsReport(cardId, period = '30d', format = 'json') {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${this.baseURL}/export/${cardId}?period=${period}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to export analytics report: ${response.status}`);
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${cardId}-${period}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      throw error;
    }
  }

  // Start session tracking
  startSession() {
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
    
    // Track session start
    this.trackPageView(window.location.pathname);
    
    // Set up page visibility tracking
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Track session end
        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
        this.trackCardInteraction(null, 'session_end', { timeSpent });
      }
    });
  }

  // Track scroll depth
  trackScrollDepth(cardId, depth) {
    this.trackCardInteraction(cardId, 'scroll', { scrollDepth: depth });
  }

  // Track time spent
  trackTimeSpent(cardId, timeSpent) {
    this.trackCardInteraction(cardId, 'time_spent', { timeSpent });
  }
}

export default new AnalyticsService(); 