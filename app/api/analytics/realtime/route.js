import { NextResponse } from 'next/server';
import GA4Service from '../../../../lib/ga4Service';

export async function GET(request) {
  try {
    console.log('🔍 API Route: /api/analytics/realtime - Request received');

    const ga4 = GA4Service.getInstance();

    // read optional range param for realtime sources
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || 'realtime';

    // Get active users count only

    // Get active users, top countries, top cities
    const { totalActiveUsers, topCountries, topCities } = await ga4.getActiveUsers();

    // Get engagement metrics for very recent window (1 day) - processed includes isMock/rawResponse
    const engagement = await ga4.getEngagementMetrics('1daysAgo', 'today');

  // Get realtime lists: top events and traffic sources (top pages removed)
  const topEvents = await ga4.getRealtimeTopEvents(10);
  const realtimeSources = await ga4.getRealtimeTrafficSources(10, range);

    const responseData = {
      success: true,
      data: {
        totalActiveUsers,
        topCountries,
        topCities,
        engagement,
        topEvents,
        realtimeSources
      }
    };

    console.log('📊 API Route: /api/analytics/realtime - Sending response', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ API Route: /api/analytics/realtime - Error', error);
    const ga4 = GA4Service.getInstance();
    const mockActive = ga4.getMockActiveUsers ? ga4.getMockActiveUsers() : { totalActiveUsers: 0, topCountries: [] };
    const mockEngagement = ga4.getMockEngagement ? ga4.getMockEngagement() : {};

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: {
          activeUsers: mockActive,
          engagementMetrics: mockEngagement
        }
      },
      { status: 500 }
    );
  }
}
