/**
 * Gemini AI API Service for Policy Generation
 * Integrates with Google AI Studio's Gemini API to generate policy content
 * Uses official @google/genai SDK
 */

import { GoogleGenAI } from "@google/genai";

// Use server-side environment variable (without NEXT_PUBLIC_ prefix for security)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const PRIMARY_MODEL = process.env.GEMINI_MODEL || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"]; // ordered preference

/**
 * Policy-specific prompt templates
 */
const POLICY_PROMPTS = {
  'Return and refund policy': {
    systemPrompt: `You are a legal expert specializing in e-commerce return and refund policies. Generate a comprehensive, professional return and refund policy that is customer-friendly yet protects the business. Include sections on return timeframes, condition requirements, refund processing, and exceptions.`,
    context: 'e-commerce return and refund policy'
  },
  'Privacy policy': {
    systemPrompt: `You are a privacy law expert. Generate a comprehensive privacy policy that complies with GDPR, CCPA, and other major privacy regulations. Include sections on data collection, usage, sharing, user rights, cookies, and contact information for privacy concerns.`,
    context: 'privacy policy for website/e-commerce'
  },
  'Terms of service': {
    systemPrompt: `You are a legal expert in terms of service agreements. Generate comprehensive terms of service that protect the business while being fair to users. Include sections on user responsibilities, prohibited activities, intellectual property, limitation of liability, and dispute resolution.`,
    context: 'terms of service agreement'
  },
  'Shipping policy': {
    systemPrompt: `You are an e-commerce logistics expert. Generate a clear and comprehensive shipping policy that sets proper customer expectations. Include sections on shipping methods, processing times, delivery timeframes, shipping costs, international shipping, and damaged/lost package procedures.`,
    context: 'e-commerce shipping policy'
  },
  'Contact information': {
    systemPrompt: `You are a customer service expert. Generate a comprehensive contact information page that provides multiple ways for customers to reach support. Include sections on customer service hours, response times, different contact methods, and what information to include when contacting support.`,
    context: 'customer contact information page'
  }
};

/**
 * Generate policy content using Gemini AI
 * @param {string} policyType - The type of policy to generate
 * @param {string} userPrompt - User's specific requirements or customization
 * @param {Object} businessInfo - Optional business information for personalization
 * @returns {Promise<string>} Generated policy content in HTML format
 */
export async function generatePolicyContent(policyType, userPrompt, businessInfo = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
  }

  const policyTemplate = POLICY_PROMPTS[policyType];
  if (!policyTemplate) {
    throw new Error(`Unsupported policy type: ${policyType}`);
  }

  // Construct the full prompt
  const businessContext = businessInfo.name ? `for ${businessInfo.name}` : '';
  const fullPrompt = `${policyTemplate.systemPrompt}

Business Context: Generate a ${policyTemplate.context} ${businessContext}.

User Requirements: ${userPrompt}

Additional Business Information:
${businessInfo.name ? `- Business Name: ${businessInfo.name}` : ''}
${businessInfo.type ? `- Business Type: ${businessInfo.type}` : ''}
${businessInfo.location ? `- Location: ${businessInfo.location}` : ''}
${businessInfo.website ? `- Website: ${businessInfo.website}` : ''}
${businessInfo.email ? `- Contact Email: ${businessInfo.email}` : ''}

Requirements:
1. Generate professional, legally sound content
2. Use clear, easy-to-understand language
3. Format the output as clean HTML with proper headings (h2, h3), paragraphs, and lists
4. Include all necessary sections for this type of policy
5. Make it comprehensive but not overly complex
6. Ensure compliance with common legal requirements
7. Use placeholder text like [BUSINESS NAME], [EMAIL], [ADDRESS] where specific business details are needed

Please generate the complete policy content now:`;

  try {
    // Initialize the Gemini AI client with API key
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const tryGenerateWithRetry = async (modelName) => {
      const maxAttempts = 3;
      let attempt = 0;
      // Exponential backoff: 500ms, 1000ms, 2000ms
      while (attempt < maxAttempts) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
          });
          const generatedContent = response.text;
          if (!generatedContent) {
            throw new Error('No content generated from Gemini API');
          }
          return generatedContent;
        } catch (err) {
          // If 503/UNAVAILABLE or overloaded, retry
          const message = err?.message || '';
          const isOverloaded = message.includes('overloaded') || message.includes('UNAVAILABLE') || message.includes('503');
          attempt += 1;
          if (!isOverloaded || attempt >= maxAttempts) {
            throw err;
          }
          const delayMs = 500 * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
      throw new Error('Failed to generate after retries');
    };

    // Try primary then fallbacks
    let rawContent = null;
    let lastError = null;
    for (const modelName of FALLBACK_MODELS) {
      try {
        rawContent = await tryGenerateWithRetry(modelName);
        break;
      } catch (err) {
        lastError = err;
        continue;
      }
    }
    if (!rawContent) throw lastError || new Error('Generation failed');

    return cleanupGeneratedContent(rawContent);

  } catch (error) {
    console.error('Error generating policy content:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key') || error.message?.includes('apiKey')) {
      throw new Error('Invalid API key. Please check your NEXT_PUBLIC_GEMINI_API_KEY in the .env file.');
    } else if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
    } else if (error.message?.includes('model')) {
      throw new Error(`Model error: ${error.message}. Tried: ${FALLBACK_MODELS.join(', ')}`);
    } else {
      throw new Error(`Failed to generate policy content: ${error.message}`);
    }
  }
}

/**
 * Clean up and format the generated content
 * @param {string} content - Raw generated content
 * @returns {string} Cleaned and formatted HTML content
 */
function cleanupGeneratedContent(content) {
  // Remove any markdown formatting and convert to HTML if needed
  let cleaned = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1
    .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2
    .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3
    .replace(/^- (.*$)/gm, '<li>$1</li>') // List items
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>'); // Numbered list items

  // Wrap consecutive list items in ul/ol tags
  cleaned = cleaned.replace(/(<li>.*<\/li>\s*)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Wrap paragraphs
  const lines = cleaned.split('\n');
  const htmlLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<li')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });

  return htmlLines.filter(line => line).join('\n');
}

/**
 * Get available policy types
 * @returns {Array<string>} List of supported policy types
 */
export function getAvailablePolicyTypes() {
  return Object.keys(POLICY_PROMPTS);
}

/**
 * Validate if a policy type is supported
 * @param {string} policyType - Policy type to validate
 * @returns {boolean} True if supported
 */
export function isPolicyTypeSupported(policyType) {
  return policyType in POLICY_PROMPTS;
}