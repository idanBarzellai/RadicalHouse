const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

const requestCounts = new Map();

export function checkRateLimit(identifier) {
    const now = Date.now();
    const userRequests = requestCounts.get(identifier) || [];

    // Remove old requests
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS) {
        return false;
    }

    recentRequests.push(now);
    requestCounts.set(identifier, recentRequests);
    return true;
}

export function getRemainingRequests(identifier) {
    const now = Date.now();
    const userRequests = requestCounts.get(identifier) || [];
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
    return Math.max(0, MAX_REQUESTS - recentRequests.length);
}

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [identifier, requests] of requestCounts.entries()) {
        const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
        if (recentRequests.length === 0) {
            requestCounts.delete(identifier);
        } else {
            requestCounts.set(identifier, recentRequests);
        }
    }
}, RATE_LIMIT_WINDOW); 