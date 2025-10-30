import { NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production, consider Redis)
const requests = new Map();

export function rateLimit(limit = 10, windowMs = 60000) {
  return function middleware(request) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);

    if (userRequests.length >= limit) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests, please try again later.' 
        },
        { status: 429 }
      );
    }

    // Add current request
    userRequests.push(now);
    requests.set(ip, userRequests);

    return null; // Continue to next middleware
  };
}

// Predefined rate limiters
export const loginRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimit = rateLimit(100, 60 * 1000); // 100 requests per minute
export const strictRateLimit = rateLimit(20, 60 * 1000); // 20 requests per minute
