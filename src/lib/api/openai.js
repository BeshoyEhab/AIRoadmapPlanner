/**
 * OpenAI integration for AI Roadmap Planner
 * Handles content generation using GPT models
 */

/**
 * Default system prompt for roadmap generation
 */
const DEFAULT_SYSTEM_PROMPT = `You are an expert curriculum designer and educator. Your task is to create detailed, structured learning roadmaps. Focus on:
- Clear learning progression
- Practical skill development
- Industry-relevant content
- Measurable learning objectives
- Realistic time estimates

Format all responses in clear, structured JSON.`;

/**
 * Handles OpenAI API calls with proper error handling and retries
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} - API response
 */
async function callOpenAI(endpoint, options) {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify(options.body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "API request failed");
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
      }
    }
  }

  throw lastError;
}

/**
 * Generates roadmap content using OpenAI API
 * @param {Object} params - Generation parameters
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Generated content
 */
export async function generateRoadmapContent(
  { field, targetLevel, prerequisites = [], timeConstraint, preferences = {} },
  apiKey,
) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const messages = [
    {
      role: "system",
      content: DEFAULT_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: JSON.stringify({
        type: "roadmap_request",
        field,
        targetLevel,
        prerequisites,
        timeConstraint,
        preferences,
      }),
    },
  ];

  try {
    const completion = await callOpenAI("chat/completions", {
      apiKey,
      body: {
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Invalid response format from API");
    }
  } catch (err) {
    console.error("Error generating roadmap content:", err);
    throw new Error("Failed to generate roadmap content: " + err.message);
  }
}

/**
 * Generates prerequisites for a given field and level
 * @param {Object} params - Generation parameters
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Array>} - Generated prerequisites
 */
export async function generatePrerequisites({ field, targetLevel }, apiKey) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const messages = [
    {
      role: "system",
      content: DEFAULT_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: JSON.stringify({
        type: "prerequisites_request",
        field,
        targetLevel,
      }),
    },
  ];

  try {
    const completion = await callOpenAI("chat/completions", {
      apiKey,
      body: {
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No prerequisites generated");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Invalid prerequisites format from API");
    }
  } catch (err) {
    console.error("Error generating prerequisites:", err);
    throw new Error("Failed to generate prerequisites: " + err.message);
  }
}

/**
 * Generates field-specific recommendations
 * @param {Object} params - Generation parameters
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Generated recommendations
 */
export async function generateRecommendations(
  { field, targetLevel, roadmapContent },
  apiKey,
) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const messages = [
    {
      role: "system",
      content: DEFAULT_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: JSON.stringify({
        type: "recommendations_request",
        field,
        targetLevel,
        roadmapContent,
      }),
    },
  ];

  try {
    const completion = await callOpenAI("chat/completions", {
      apiKey,
      body: {
        model: "gpt-4",
        messages,
        temperature: 0.8,
        max_tokens: 1500,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No recommendations generated");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Invalid recommendations format from API");
    }
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw new Error("Failed to generate recommendations: " + error.message);
  }
}

/**
 * Enhances roadmap content with additional details
 * @param {Object} roadmap - Base roadmap content
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Enhanced roadmap content
 */
export async function enhanceRoadmapContent(roadmap, apiKey) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const messages = [
    {
      role: "system",
      content: DEFAULT_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: JSON.stringify({
        type: "enhancement_request",
        roadmap,
      }),
    },
  ];

  try {
    const completion = await callOpenAI("chat/completions", {
      apiKey,
      body: {
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No enhancements generated");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Invalid enhancement format from API");
    }
  } catch (err) {
    console.error("Error enhancing roadmap:", err);
    throw new Error("Failed to enhance roadmap: " + err.message);
  }
}
