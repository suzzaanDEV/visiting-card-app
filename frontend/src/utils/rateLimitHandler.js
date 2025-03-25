// Utility function to handle rate limit errors
export const handleRateLimitError = (response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after') || '15 minutes';
    const errorMessage = `Rate limit exceeded. Please wait ${retryAfter} before trying again.`;
    throw new Error(errorMessage);
  }
  return response;
};

// Utility function to add rate limit handling to fetch requests
export const fetchWithRateLimit = async (url, options = {}) => {
  const response = await fetch(url, options);
  return handleRateLimitError(response);
};

// Utility function to show rate limit error to user
export const showRateLimitError = (error) => {
  if (error.message.includes('Rate limit exceeded')) {
    // You can customize this to show a toast notification or modal
    console.warn('Rate limit error:', error.message);
    return true;
  }
  return false;
};

// Utility function to get retry delay from rate limit headers
export const getRetryDelay = (response) => {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    return parseInt(retryAfter) * 1000; // Convert to milliseconds
  }
  return 15 * 60 * 1000; // Default 15 minutes
}; 