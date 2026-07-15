import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client with environment variables
let redis;
let ratelimiters = {};

// Rate limit configurations
const LIMITS = {
  contact: { limit: 8, window: '1 h' }, // 8 requests per hour per IP+email
  inquiry: { limit: 15, window: '1 h' }, // 15 requests per hour per IP
  enroll: { limit: 15, window: '1 h' }, // 15 requests per hour per IP
  register: { limit: 10, window: '1 h' }, // 10 requests per hour per IP
  adminLogin: { limit: 5, window: '15 m' }, // 5 requests per 15 minutes per IP
  adminCrud: { limit: 100, window: '1 h' }, // 100 requests per hour per IP
};

/**
 * Initialize the Redis client and rate limiters
 * This is done lazily to avoid errors if env vars are not set
 */
function initializeRedis() {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[RateLimit] Upstash Redis credentials not configured. Rate limiting disabled (fail-open).');
    return null;
  }

  try {
    redis = new Redis({
      url,
      token,
    });
    return redis;
  } catch (error) {
    console.error('[RateLimit] Failed to initialize Redis client:', error);
    return null;
  }
}

/**
 * Get or create a rate limiter for a specific limit type
 */
function getRatelimiter(limitType) {
  if (ratelimiters[limitType]) {
    return ratelimiters[limitType];
  }

  const config = LIMITS[limitType];
  if (!config) {
    throw new Error(`Unknown rate limit type: ${limitType}`);
  }

  const client = initializeRedis();
  if (!client) {
    return null;
  }

  try {
    ratelimiters[limitType] = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(config.limit, config.window),
      analytics: false,
      prefix: `ratelimit:${limitType}`,
    });
    return ratelimiters[limitType];
  } catch (error) {
    console.error(`[RateLimit] Failed to create rate limiter for ${limitType}:`, error);
    return null;
  }
}

/**
 * Check if a request should be rate limited
 * @param {string} limitType - The type of rate limit to apply (from LIMITS)
 * @param {string} identifier - Unique identifier for the requester (IP, IP+email, etc.)
 * @param {Object} options - Additional options
 * @param {boolean} options.skipIfAdmin - Skip rate limiting if admin session is present
 * @param {import('next-auth').Session} options.session - NextAuth session object
 * @returns {Promise<{success: boolean, limit?: number, remaining?: number, reset?: number, error?: string}>}
 */
export async function checkRateLimit(limitType, identifier, options = {}) {
  const { skipIfAdmin = false, session = null } = options;

  // Skip rate limiting for authenticated admins if configured
  if (skipIfAdmin && session?.user?.role === 'admin') {
    return { success: true };
  }

  const ratelimiter = getRatelimiter(limitType);

  // If ratelimiter is not available (Redis down or not configured), fail open
  if (!ratelimiter) {
    console.warn(`[RateLimit] Rate limiter not available for ${limitType}. Allowing request (fail-open).`);
    return { success: true };
  }

  try {
    const result = await ratelimiter.limit(identifier);

    if (!result.success) {
      // Calculate time until reset in minutes
      const resetTime = Math.ceil((result.reset - Date.now()) / 1000 / 60);
      const timeString = resetTime < 1 ? 'less than a minute' : `${resetTime} minute${resetTime > 1 ? 's' : ''}`;

      return {
        success: false,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        error: `Too many requests — please try again in ${timeString}, or reach us directly on WhatsApp`,
      };
    }

    return {
      success: true,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Fail open on any Redis error
    console.error(`[RateLimit] Error checking rate limit for ${limitType}:`, error);
    console.warn('[RateLimit] Allowing request due to rate limit error (fail-open).');
    return { success: true };
  }
}

/**
 * Get client IP address from request
 * @param {Request} request - Next.js request object
 * @returns {string} IP address
 */
export function getClientIp(request) {
  // Try various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a default if no IP found
  return 'unknown';
}

/**
 * Get NextAuth session from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<import('next-auth').Session|null>}
 */
export async function getSession(request) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('[RateLimit] Error getting session:', error);
    return null;
  }
}
