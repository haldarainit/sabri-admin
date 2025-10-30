// Google Analytics 4 Data API service
import { BetaAnalyticsDataClient } from '@google-analytics/data';

class GA4Service {
  static instance = null;
  
  static getInstance() {
    if (!GA4Service.instance) {
      GA4Service.instance = new GA4Service();
    }
    return GA4Service.instance;
  }
  constructor() {
    this.analyticsDataClient = null;
    this.propertyId = process.env.GA4_PROPERTY_ID;
    
    // Initialize GA4 client if credentials are available
    if (process.env.GA4_SERVICE_ACCOUNT_KEY && process.env.GA4_PROPERTY_ID) {
      try {
        // Clean up the JSON string by removing line breaks and extra spaces
        const cleanedJson = process.env.GA4_SERVICE_ACCOUNT_KEY
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log('🔧 GA4 Service: Parsing credentials...');
        const credentials = JSON.parse(cleanedJson);
        
        this.analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: credentials
        });
        console.log('✅ GA4 Service: Connected to Google Analytics 4');
        console.log('✅ GA4 Service: Property ID:', this.propertyId);
      } catch (error) {
        console.warn('❌ GA4 Service: Invalid credentials, using mock data:', error.message);
        console.warn('❌ GA4 Service: Error details:', error);
        console.warn('❌ GA4 Service: Raw key length:', process.env.GA4_SERVICE_ACCOUNT_KEY?.length);
        this.analyticsDataClient = null;
      }
    } else {
      console.log('⚠️ GA4 Service: Using mock data (GA4 not configured)');
      console.log('⚠️ GA4 Service: Missing environment variables');
    }
  }

  // Get user demographics data
  async getUserDemographics(startDate, endDate) {
    console.log('🔍 GA4 API: Fetching user demographics...', { startDate, endDate });
    
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock demographics data - GA4 not configured');
      return this.getMockDemographics();
    }

    try {
      console.log('🚀 GA4 API: Making request to Google Analytics API...');
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'country' },
          { name: 'city' },
          { name: 'userAgeBracket' },
          { name: 'userGender' }
        ],
        metrics: [{ name: 'activeUsers' }],
        limit: 100
      });

      console.log('✅ GA4 API: Demographics data fetched successfully');
      console.log('📊 GA4 API: Response data:', response);
      return this.processDemographicsData(response);
    } catch (error) {
      console.error('❌ GA4 API: Failed to fetch demographics data:', error);
      console.warn('⚠️ GA4 API: Using mock data due to API error');
      return this.getMockDemographics();
    }
  }

  // Get traffic sources data
  async getTrafficSources(startDate, endDate) {
    console.log('🔍 GA4 API: Fetching traffic sources...', { startDate, endDate });
    
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock traffic sources data - GA4 not configured');
      return this.getMockTrafficSources();
    }

    try {
      console.log('🚀 GA4 API: Making request to Google Analytics API...');
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
        metrics: [{ name: 'sessions' }],
        limit: 1000
      });

      console.log('✅ GA4 API: Traffic sources data fetched successfully');
      console.log('📊 GA4 API: Response data:', response);
      return this.processTrafficSourcesData(response);
    } catch (error) {
      console.error('❌ GA4 API: Failed to fetch traffic sources data:', error);
      console.warn('⚠️ GA4 API: Using mock data due to API error');
      return this.getMockTrafficSources();
    }
  }

  // Get engagement metrics
  async getEngagementMetrics(startDate, endDate) {
    console.log('🔍 GA4 API: Fetching engagement metrics...', { startDate, endDate });
    console.log('📅 GA4 API: Date range details:');
    console.log('  - Start Date:', startDate, '(type:', typeof startDate, ')');
    console.log('  - End Date:', endDate, '(type:', typeof endDate, ')');
    console.log('🔍 GA4 API: Analytics client status:', !!this.analyticsDataClient);
    console.log('🔍 GA4 API: Property ID:', this.propertyId);
    
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock engagement data - GA4 not configured');
      console.log('⚠️ GA4 API: Analytics client status:', !!this.analyticsDataClient);
      console.log('⚠️ GA4 API: Property ID status:', !!this.propertyId);
      console.log('⚠️ GA4 API: Service account key status:', !!process.env.GA4_SERVICE_ACCOUNT_KEY);
      // Return mock engagement and mark isMock so callers can detect mock usage
      return { ...this.getMockEngagement(), isMock: true };
    }

    try {
      console.log('🚀 GA4 API: Making request to Google Analytics API...');
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'pageViews' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'averageSessionDuration' },
          { name: 'eventCount' },
          { name: 'keyEvents' },
          { name: 'sessionKeyEventRate' }
        ]
      });

      console.log('✅ GA4 API: Engagement metrics fetched successfully');
      console.log('📊 GA4 API: Response data:', response);
      console.log('📊 GA4 API: Response rows:', response.rows);
      console.log('📊 GA4 API: Response rowCount:', response.rowCount);
      console.log('📊 GA4 API: Date range used:', { startDate, endDate });
      console.log('📊 GA4 API: Property ID used:', this.propertyId);
      
      if (!response.rows || response.rows.length === 0) {
        console.warn('⚠️ GA4 API: No data returned from API, using mock data');
        return { ...this.getMockEngagement(), isMock: true };
      }

      // Return processed metrics and include rawResponse and isMock=false
      const processed = this.processEngagementData(response);
      return { ...processed, isMock: false, rawResponse: response };
    } catch (error) {
      console.error('❌ GA4 API: Failed to fetch engagement metrics:', error);
      console.error('❌ GA4 API: Error details:', error.message);
      console.error('❌ GA4 API: Error stack:', error.stack);
      console.warn('⚠️ GA4 API: Using mock data due to API error');
      return { ...this.getMockEngagement(), isMock: true, error: error.message };
    }
  }

  // Get new vs returning users
  async getNewVsReturningUsers(startDate, endDate) {
    console.log('🔍 GA4 API: Fetching user types...', { startDate, endDate });
    
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock user types data - GA4 not configured');
      return this.getMockUserTypes();
    }

    try {
      console.log('🚀 GA4 API: Making request to Google Analytics API...');
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'newVsReturning' }],
        metrics: [{ name: 'activeUsers' }]
      });

      console.log('✅ GA4 API: User types data fetched successfully');
      console.log('📊 GA4 API: Response data:', response);
      return this.processUserTypesData(response);
    } catch (error) {
      console.error('❌ GA4 API: Failed to fetch user types data:', error);
      console.warn('⚠️ GA4 API: Using mock data due to API error');
      return this.getMockUserTypes();
    }
  }

  // Get active users in last 30 minutes (real-time data)
  async getActiveUsers() {
    console.log('🔍 GA4 API: Fetching active users in last 30 minutes...');
    
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock active users data - GA4 not configured');
      return this.getMockActiveUsers();
    }

    try {
      console.log('🚀 GA4 API: Making real-time request to Google Analytics API (30 min window)...');
      const [response] = await this.analyticsDataClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [
          { name: 'country' },
          { name: 'city' }
        ],
        metrics: [{ name: 'activeUsers' }],
        limit: 100
      });

      console.log('✅ GA4 API: Active users data fetched successfully');
      console.log('📊 GA4 API: Real-time response data:', response);
      return this.processActiveUsersData(response);
    } catch (error) {
      console.error('❌ GA4 API: Failed to fetch active users data:', error);
      console.warn('⚠️ GA4 API: Using mock data due to API error');
      return this.getMockActiveUsers();
    }
  }

  // Get realtime top pages (by active users or events)
  async getRealtimeTopPages(limit = 10) {
    console.log('🔍 GA4 API: Fetching realtime top pages...');
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock top pages data - GA4 not configured');
      return [{ path: '/', title: 'Home', activeUsers: -1 }];
    }

    try {
      const [response] = await this.analyticsDataClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'activeUsers' }],
        limit: limit
      });

      const pages = (response.rows || []).map(row => ({
        path: row.dimensionValues[0]?.value || '',
        title: row.dimensionValues[1]?.value || '',
        activeUsers: parseInt(row.metricValues[0]?.value) || 0
      }));

      return pages.slice(0, limit);
    } catch (error) {
      console.error('❌ GA4 API: Failed to fetch realtime top pages (realtime API). Falling back to last-day aggregated report:', error);
      // Fallback: try a regular runReport for the last day to at least provide useful data
      try {
        const [resp] = await this.analyticsDataClient.runReport({
          property: `properties/${this.propertyId}`,
          dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [{ name: 'pageViews' }],
          orderBys: [{ metric: { metricName: 'pageViews' }, desc: true }],
          limit: limit
        });

        const pages = (resp.rows || []).map(row => ({
          path: row.dimensionValues[0]?.value || '',
          title: row.dimensionValues[1]?.value || '',
          activeUsers: parseInt(row.metricValues[0]?.value) || 0
        }));

        return pages.slice(0, limit);
      } catch (err) {
        console.error('❌ GA4 API: Fallback runReport for top pages also failed:', err);
        return [{ path: '/', title: 'Home', activeUsers: -1 }];
      }
    }
  }

  // Get realtime top events
  async getRealtimeTopEvents(limit = 10) {
    console.log('🔍 GA4 API: Fetching realtime top events...');
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock top events data - GA4 not configured');
      return [{ eventName: 'page_view', count: -1 }];
    }

    try {
      const [response] = await this.analyticsDataClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        limit: limit
      });

      const events = (response.rows || []).map(row => ({
        eventName: row.dimensionValues[0]?.value || '(not set)',
        count: parseInt(row.metricValues[0]?.value) || 0
      }));

      return events.slice(0, limit);
    } catch (error) {
      console.error('❌ GA4 API: Failed to fetch realtime top events (realtime API). Falling back to last-day aggregated report:', error);
      // Fallback to aggregated event counts over the last day
      try {
        const [resp] = await this.analyticsDataClient.runReport({
          property: `properties/${this.propertyId}`,
          dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          limit: limit
        });

        const events = (resp.rows || []).map(row => ({
          eventName: row.dimensionValues[0]?.value || '(not set)',
          count: parseInt(row.metricValues[0]?.value) || 0
        }));

        return events.slice(0, limit);
      } catch (err) {
        console.error('❌ GA4 API: Fallback runReport for top events also failed:', err);
        return [{ eventName: 'page_view', count: -1 }];
      }
    }
  }

  // Get realtime top traffic sources
  // Compute start/end dates (YYYY-MM-DD) or detect realtime for given range label
  computeRangeDates(rangeLabel) {
    if (!rangeLabel) return { isRealtime: true };
    const label = String(rangeLabel).toLowerCase();
    const today = new Date();

    const fmt = (d) => d.toISOString().slice(0, 10);

    // Helper: get start of week (Monday)
    const startOfWeek = (d) => {
      const copy = new Date(d);
      const day = copy.getDay(); // 0=Sun,1=Mon
      const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
      copy.setDate(copy.getDate() + diff);
      return copy;
    };

    if (label === 'realtime' || label === 'realtime (30m)' || label === 'last 30 minutes') {
      return { isRealtime: true };
    }

    if (label === 'today') {
      return { isRealtime: false, startDate: fmt(today), endDate: fmt(today) };
    }

    if (label === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { isRealtime: false, startDate: fmt(y), endDate: fmt(y) };
    }

    if (label === 'this week') {
      const start = startOfWeek(today);
      return { isRealtime: false, startDate: fmt(start), endDate: fmt(today) };
    }

    if (label === 'last week') {
      const thisStart = startOfWeek(today);
      const lastStart = new Date(thisStart);
      lastStart.setDate(lastStart.getDate() - 7);
      const lastEnd = new Date(thisStart);
      lastEnd.setDate(lastEnd.getDate() - 1);
      return { isRealtime: false, startDate: fmt(lastStart), endDate: fmt(lastEnd) };
    }

    // Ranges expressed as 'N days ago' -> use GA relative syntax
    if (label === 'last 7 days') return { isRealtime: false, startDate: '7daysAgo', endDate: 'today' };
    if (label === 'last 14 days') return { isRealtime: false, startDate: '14daysAgo', endDate: 'today' };
    if (label === 'last 28 days') return { isRealtime: false, startDate: '28daysAgo', endDate: 'today' };
    if (label === 'last 30 days') return { isRealtime: false, startDate: '30daysAgo', endDate: 'today' };
    if (label === 'last 60 days') return { isRealtime: false, startDate: '60daysAgo', endDate: 'today' };

    // Default: treat unknown as realtime
    return { isRealtime: true };
  }

  // Get realtime top traffic sources — supports a `rangeLabel` to request historical ranges
  async getRealtimeTrafficSources(limit = 10, rangeLabel = 'realtime') {
    console.log('🔍 GA4 API: Fetching realtime traffic sources...', { rangeLabel });
    if (!this.analyticsDataClient || !this.propertyId) {
      console.log('⚠️ GA4 API: Using mock realtime traffic sources - GA4 not configured');
      return [{ source: 'direct', medium: '', users: -1 }];
    }

    const rangeInfo = this.computeRangeDates(rangeLabel);
    if (rangeInfo.isRealtime) {
      try {
        const [response] = await this.analyticsDataClient.runRealtimeReport({
          property: `properties/${this.propertyId}`,
          dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
          metrics: [{ name: 'activeUsers' }],
          limit: limit
        });

        const sources = (response.rows || []).map(row => ({
          source: row.dimensionValues[0]?.value || '(not set)',
          medium: row.dimensionValues[1]?.value || '(not set)',
          users: parseInt(row.metricValues[0]?.value) || 0
        }));

        return sources.slice(0, limit);
      } catch (error) {
        console.error('❌ GA4 API: Failed to fetch realtime traffic sources (realtime API). Falling back to aggregated traffic sources:', error);
        // fallthrough to aggregated path below
      }
    }

    // Aggregated/historical path
    try {
      let startDate = rangeInfo.startDate;
      let endDate = rangeInfo.endDate;

      // If startDate is a relative GA token like '7daysAgo', pass it through
      if (!startDate || !endDate) {
        // default to last 7 days if missing
        startDate = '7daysAgo';
        endDate = 'today';
      }

      const traffic = await this.getTrafficSources(startDate, endDate);
      // getTrafficSources returns an object like { direct: n, organic: n, ... }
      const arr = Object.entries(traffic || {}).map(([k, v]) => ({ source: k, medium: '', users: v }));
      return arr.slice(0, limit);
    } catch (err) {
      console.error('❌ GA4 API: Fallback for realtime traffic sources also failed:', err);
      return [{ source: 'direct', medium: '', users: -1 }];
    }
  }

  // Helper methods for specific data
  async getAgeGroups(startDate, endDate) {
    const [response] = await this.analyticsDataClient.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'userAgeBracket' }],
      metrics: [{ name: 'users' }]
    });

    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    
    response.rows?.forEach(row => {
      const age = row.dimensionValues[0].value;
      const users = parseInt(row.metricValues[0].value);
      
      if (age.includes('18-24')) ageGroups['18-24'] = users;
      else if (age.includes('25-34')) ageGroups['25-34'] = users;
      else if (age.includes('35-44')) ageGroups['35-44'] = users;
      else if (age.includes('45-54')) ageGroups['45-54'] = users;
      else if (age.includes('55+')) ageGroups['55+'] = users;
    });

    return ageGroups;
  }

  async getGenderDistribution(startDate, endDate) {
    const [response] = await this.analyticsDataClient.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'userGender' }],
      metrics: [{ name: 'users' }]
    });

    const gender = { 'Male': 0, 'Female': 0, 'Other': 0 };
    
    response.rows?.forEach(row => {
      const genderType = row.dimensionValues[0].value;
      const users = parseInt(row.metricValues[0].value);
      
      if (genderType === 'male') gender['Male'] = users;
      else if (genderType === 'female') gender['Female'] = users;
      else gender['Other'] = users;
    });

    return gender;
  }

  async getTopLocations(startDate, endDate) {
    const [response] = await this.analyticsDataClient.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'users' }],
      orderBys: [{ metric: { metricName: 'users' }, desc: true }],
      limit: 5
    });

    return response.rows?.map(row => ({
      location: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];
  }

  // Mock data fallbacks
  getMockDemographics() {
    return {
      ageGroups: { '18-24': -1, '25-34': -1, '35-44': -1, '45-54': -1, '55+': -1 },
      genderDistribution: { 'Male': -1, 'Female': -1, 'Other': -1 },
      cities: [
        { city: 'Mumbai', country: 'India', users: -1 },
        { city: 'Delhi', country: 'India', users: -1 },
        { city: 'Bangalore', country: 'India', users: -1 },
        { city: 'Chennai', country: 'India', users: -1 },
        { city: 'Kolkata', country: 'India', users: -1 },
        { city: 'New York', country: 'United States', users: -1 },
        { city: 'Los Angeles', country: 'United States', users: -1 },
        { city: 'Chicago', country: 'United States', users: -1 },
        { city: 'Houston', country: 'United States', users: -1 },
        { city: 'Phoenix', country: 'United States', users: -1 },
        { city: 'London', country: 'United Kingdom', users: -1 },
        { city: 'Manchester', country: 'United Kingdom', users: -1 },
        { city: 'Birmingham', country: 'United Kingdom', users: -1 },
        { city: 'Toronto', country: 'Canada', users: -1 },
        { city: 'Vancouver', country: 'Canada', users: -1 },
        { city: 'Montreal', country: 'Canada', users: -1 },
        { city: 'Sydney', country: 'Australia', users: -1 },
        { city: 'Melbourne', country: 'Australia', users: -1 },
        { city: 'Berlin', country: 'Germany', users: -1 },
        { city: 'Munich', country: 'Germany', users: -1 },
        { city: 'Paris', country: 'France', users: -1 },
        { city: 'Lyon', country: 'France', users: -1 },
        { city: 'São Paulo', country: 'Brazil', users: -1 },
        { city: 'Rio de Janeiro', country: 'Brazil', users: -1 },
        { city: 'Beijing', country: 'China', users: -1 },
        { city: 'Shanghai', country: 'China', users: -1 },
        { city: 'Tokyo', country: 'Japan', users: -1 },
        { city: 'Osaka', country: 'Japan', users: -1 }
      ]
    };
  }

  getMockTrafficSources() {
    return {
      direct: -1,
      organic: -1,
      social: -1,
      paid: -1,
      referral: -1
    };
  }

  getMockEngagement() {
    return {
      pageViews: -1,
      sessions: -1,
      bounceRate: -1,
      engagedSessions: -1,
      engagementRate: -1,
      averageSessionDuration: -1,
      eventCount: -1,
      keyEvents: -1,
      sessionKeyEventRate: -1
    };
  }

  getMockUserTypes() {
    return {
      newUsers: -1,
      returningUsers: -1
    };
  }

  getMockActiveUsers() {
    return {
      totalActiveUsers: -1,
      topCountries: [
        { country: 'India', users: -1 },
        { country: 'United States', users: -1 },
        { country: 'United Kingdom', users: -1 },
        { country: 'Canada', users: -1 },
        { country: 'Australia', users: -1 },
        { country: 'Germany', users: -1 },
        { country: 'France', users: -1 },
        { country: 'Brazil', users: -1 },
        { country: 'China', users: -1 },
        { country: 'Japan', users: -1 }
      ]
    };
  }

  // Data processing methods for real GA4 data
  processDemographicsData(response) {
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    const genderDistribution = { 'Male': 0, 'Female': 0, 'Other': 0 };
    const locations = {};

    response.rows?.forEach(row => {
      const ageBracket = row.dimensionValues[2].value;
      const gender = row.dimensionValues[3].value;
      const city = row.dimensionValues[1].value;
      const country = row.dimensionValues[0].value;
      const users = parseInt(row.metricValues[0].value) || 0;

      // Process age groups
      if (ageBracket && ageBracket !== '(not set)') {
        if (ageBracket.includes('18-24')) ageGroups['18-24'] += users;
        else if (ageBracket.includes('25-34')) ageGroups['25-34'] += users;
        else if (ageBracket.includes('35-44')) ageGroups['35-44'] += users;
        else if (ageBracket.includes('45-54')) ageGroups['45-54'] += users;
        else if (ageBracket.includes('55+')) ageGroups['55+'] += users;
      }

      // Process gender
      if (gender && gender !== '(not set)') {
        if (gender.toLowerCase().includes('male')) genderDistribution['Male'] += users;
        else if (gender.toLowerCase().includes('female')) genderDistribution['Female'] += users;
        else genderDistribution['Other'] += users;
      }

      // Process locations - include all countries, not just India
      if (city && city !== '(not set)' && country && country !== '(not set)') {
        const key = `${city}-${country}`;
        locations[key] = (locations[key] || 0) + users;
      }
    });

    const cities = Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50) // Increased limit for more cities
      .map(([key, users]) => {
        const [city, country] = key.split('-');
        return { city, country, users };
      });

    return {
      ageGroups,
      genderDistribution,
      cities
    };
  }

  processTrafficSourcesData(response) {
    const sources = { direct: 0, organic: 0, social: 0, paid: 0, referral: 0 };

    response.rows?.forEach(row => {
      const channel = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value) || 0;

      if (channel.includes('Direct')) sources.direct += sessions;
      else if (channel.includes('Organic')) sources.organic += sessions;
      else if (channel.includes('Social')) sources.social += sessions;
      else if (channel.includes('Paid')) sources.paid += sessions;
      else if (channel.includes('Referral')) sources.referral += sessions;
    });

    return sources;
  }

  processEngagementData(response) {
    const metrics = response.rows?.[0]?.metricValues || [];
    
    const pageViews = parseInt(metrics[0]?.value) || 0;
    const sessions = parseInt(metrics[1]?.value) || 0;
    const bounceRate = Math.round(parseFloat(metrics[2]?.value) * 100) || 0;
    const engagedSessions = parseInt(metrics[3]?.value) || 0;
    const engagementRate = Math.round(parseFloat(metrics[4]?.value) * 100) || 0;
    const averageSessionDuration = parseFloat(metrics[5]?.value) || 0;
    const eventCount = parseInt(metrics[6]?.value) || 0;
    const keyEvents = parseInt(metrics[7]?.value) || 0;
    const sessionKeyEventRate = Math.round(parseFloat(metrics[8]?.value) * 100) || 0;
    
    console.log('📊 GA4 API: Processing engagement data:');
    console.log('  - Raw pageViews value:', metrics[0]?.value);
    console.log('  - Processed pageViews:', pageViews);
    console.log('  - Raw sessions value:', metrics[1]?.value);
    console.log('  - Processed sessions:', sessions);
    console.log('  - Raw bounceRate value:', metrics[2]?.value);
    console.log('  - Processed bounceRate:', bounceRate);
    console.log('  - Raw engagedSessions value:', metrics[3]?.value);
    console.log('  - Processed engagedSessions:', engagedSessions);
    console.log('  - Raw engagementRate value:', metrics[4]?.value);
    console.log('  - Processed engagementRate:', engagementRate);
    console.log('  - Raw averageSessionDuration value:', metrics[5]?.value);
    console.log('  - Processed averageSessionDuration:', averageSessionDuration);
    console.log('  - Raw eventCount value:', metrics[6]?.value);
    console.log('  - Processed eventCount:', eventCount);
    console.log('  - Raw keyEvents value:', metrics[7]?.value);
    console.log('  - Processed keyEvents:', keyEvents);
    console.log('  - Raw sessionKeyEventRate value:', metrics[8]?.value);
    console.log('  - Processed sessionKeyEventRate:', sessionKeyEventRate);
    
    return {
      pageViews,
      sessions,
      bounceRate,
      engagedSessions,
      engagementRate,
      averageSessionDuration,
      eventCount,
      keyEvents,
      sessionKeyEventRate
    };
  }

  processUserTypesData(response) {
    let newUsers = 0;
    let returningUsers = 0;

    response.rows?.forEach(row => {
      const userType = row.dimensionValues[0].value;
      const users = parseInt(row.metricValues[0].value) || 0;

      if (userType === 'new') newUsers += users;
      else if (userType === 'returning') returningUsers += users;
    });

    return { newUsers, returningUsers };
  }

  processActiveUsersData(response) {
    let totalActiveUsers = 0;
    const countries = {};
    const cities = {};

    response.rows?.forEach(row => {
      const country = row.dimensionValues[0].value;
      const city = row.dimensionValues[1]?.value;
      const users = parseInt(row.metricValues[0].value) || 0;

      totalActiveUsers += users;

      // Top countries
      if (country && country !== '(not set)') {
        countries[country] = (countries[country] || 0) + users;
      }
      // Top cities
      if (city && city !== '(not set)') {
        cities[city] = (cities[city] || 0) + users;
      }
    });

    const topCountries = Object.entries(countries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, users]) => ({ country, users }));

    const topCities = Object.entries(cities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([city, users]) => ({ city, users }));

    return {
      totalActiveUsers,
      topCountries,
      topCities
    };
  }
}

export default GA4Service;
