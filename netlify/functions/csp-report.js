// Netlify Function to handle CSP violation reports
exports.handler = async (event) => {
  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    // Parse the CSP violation report
    const report = JSON.parse(event.body);
    
    // Log the violation (in production, you'd want to log to a monitoring service)
    console.error('CSP Violation:', JSON.stringify(report, null, 2));
    
    return {
      statusCode: 200,
      body: 'Report received',
    };
  } catch (error) {
    console.error('Error processing CSP report:', error);
    
    return {
      statusCode: 400,
      body: 'Bad Request',
    };
  }
};
