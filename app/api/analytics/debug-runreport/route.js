import { NextResponse } from 'next/server';
import GA4Service from '../../../../lib/ga4Service';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    console.log('🔍 API Route: /api/analytics/debug-runreport - Request received', Object.fromEntries(params.entries()));

    const ga4 = GA4Service.getInstance();

    // If GA is not configured, return mock engagement (same fallback used elsewhere)
    if (!ga4.analyticsDataClient || !ga4.propertyId) {
      console.warn('⚠️ API Route: GA4 not configured; returning mock engagement data');
      const mock = ga4.getMockEngagement ? ga4.getMockEngagement() : {};
      return NextResponse.json({ success: false, message: 'GA4 not configured', rawResponse: null, mock }, { status: 200 });
    }

    // Build a basic runReport request similar to getEngagementMetrics
    const startDate = params.get('startDate') || '7daysAgo';
    const endDate = params.get('endDate') || 'today';

    // Default metrics to the same set used by getEngagementMetrics
    const metrics = params.getAll('metric')?.length ? params.getAll('metric').map(m => ({ name: m })) : [
      { name: 'pageViews' },
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'eventCount' }
    ];

    // Optional dimensions passed as ?dimension=city&dimension=country
    const dimensions = params.getAll('dimension')?.length ? params.getAll('dimension').map(d => ({ name: d })) : [];

    const requestBody = {
      property: `properties/${ga4.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics,
      dimensions,
      limit: params.get('limit') ? parseInt(params.get('limit')) : 1000
    };

    console.log('🔧 API Route: /api/analytics/debug-runreport - runReport request', requestBody);

    const [rawResponse] = await ga4.analyticsDataClient.runReport(requestBody);

    // Return both the rawResponse and the request we used so you can compare with GA UI
    return NextResponse.json({
      success: true,
      request: requestBody,
      rawResponse
    });
  } catch (error) {
    console.error('❌ API Route: /api/analytics/debug-runreport - Error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
