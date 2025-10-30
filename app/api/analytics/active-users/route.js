import { NextResponse } from 'next/server';
import GA4Service from '../../../../lib/ga4Service';

export async function GET(request) {
  try {
    console.log('🔍 API Route: /api/analytics/active-users - Request received');

    const ga4 = GA4Service.getInstance();

    const url = new URL(request.url);
    const range = url.searchParams.get('range'); // e.g., '30m', '24h', '7d', '30d'
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    // Default: realtime 30 minutes
    if (!range || range === '30m') {
      // Get active users, top countries, and top cities (real-time)
      const { totalActiveUsers, topCountries, topCities } = await ga4.getActiveUsers();
      return NextResponse.json({ success: true, data: { totalActiveUsers, topCountries, topCities, range: '30m' } });
    }

    // Map common ranges to GA date ranges
    let startDate = startDateParam;
    let endDate = endDateParam || 'today';

    if (!startDate) {
      if (range === '24h') startDate = '1daysAgo';
      else if (range === '7d') startDate = '7daysAgo';
      else if (range === '30d') startDate = '30daysAgo';
      else startDate = '7daysAgo';
    }

    console.log('🔍 API Route: /api/analytics/active-users - Using date range', { startDate, endDate });

    // For non-realtime ranges, fetch aggregated data via runReport helpers
    const topCountries = await ga4.getTopLocations(startDate, endDate);
    // Use demographics to get cities list (processed)
    const demographics = await ga4.getUserDemographics(startDate, endDate);
    const topCities = (demographics?.cities || []).slice(0, 10);

    const totalUsers = topCountries.reduce((sum, c) => sum + (c.users || 0), 0);

    const responseData = {
      success: true,
      data: {
        totalUsers,
        topCountries,
        topCities,
        range,
        startDate,
        endDate
      }
    };

    console.log('📊 API Route: /api/analytics/active-users - Sending response', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ API Route: /api/analytics/active-users - Error', error);
    const ga4 = GA4Service.getInstance();
    const mockActive = ga4.getMockActiveUsers ? ga4.getMockActiveUsers() : { totalActiveUsers: 0, topCountries: [] };

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: mockActive
      },
      { status: 500 }
    );
  }
}
