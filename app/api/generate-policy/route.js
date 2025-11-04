import { NextResponse } from 'next/server';
import { generatePolicyContent } from '../../../lib/gemini';

/**
 * API Route for AI Policy Generation
 * POST /api/generate-policy
 * 
 * This route handles policy generation requests and keeps the API key secure on the server
 */
export async function POST(request) {
  try {
    // Parse request body
    const { policyType, userPrompt, businessInfo } = await request.json();

    // Validate required fields
    if (!policyType) {
      return NextResponse.json(
        { error: 'Policy type is required' },
        { status: 400 }
      );
    }

    if (!userPrompt || !userPrompt.trim()) {
      return NextResponse.json(
        { error: 'User prompt is required' },
        { status: 400 }
      );
    }

    // Generate policy content using Gemini AI
    const generatedContent = await generatePolicyContent(
      policyType,
      userPrompt,
      businessInfo || {}
    );

    // Return the generated content
    return NextResponse.json({
      success: true,
      content: generatedContent,
      policyType: policyType
    });

  } catch (error) {
    console.error('Policy generation API error:', error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate policy content',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 });
}