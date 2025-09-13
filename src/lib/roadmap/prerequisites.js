/**
 * Prerequisites management utility for AI Roadmap Planner
 */

/**
 * Validates a prerequisite object
 * @param {Object} prerequisite - The prerequisite to validate
 * @returns {boolean} - Whether the prerequisite is valid
 */
export const validatePrerequisite = (prerequisite) => {
  if (!prerequisite || typeof prerequisite !== 'object') {
    return false;
  }

  const requiredFields = ['skill', 'level', 'description'];
  return requiredFields.every(field => prerequisite[field] !== undefined);
};

/**
 * Calculates the total estimated learning time for prerequisites
 * @param {Array} prerequisites - Array of prerequisites
 * @returns {number} - Total estimated time in hours
 */
export const calculatePrerequisitesTime = (prerequisites) => {
  if (!Array.isArray(prerequisites)) {
    return 0;
  }

  return prerequisites.reduce((total, prereq) => {
    return total + (prereq.estimatedLearningTime || 0);
  }, 0);
};

/**
 * Groups prerequisites by difficulty level
 * @param {Array} prerequisites - Array of prerequisites
 * @returns {Object} - Prerequisites grouped by level
 */
export const groupPrerequisitesByLevel = (prerequisites) => {
  if (!Array.isArray(prerequisites)) {
    return {};
  }

  return prerequisites.reduce((groups, prereq) => {
    const level = prereq.level || 'unknown';
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(prereq);
    return groups;
  }, {});
};

/**
 * Checks if all prerequisites are satisfied
 * @param {Array} prerequisites - Array of prerequisites
 * @param {Object} userKnowledge - Object containing user's knowledge levels
 * @returns {Object} - Status of prerequisites
 */
export const checkPrerequisitesSatisfied = (prerequisites, userKnowledge) => {
  if (!Array.isArray(prerequisites) || !userKnowledge) {
    return { satisfied: false, missing: [] };
  }

  const missing = prerequisites.filter(prereq => {
    const userLevel = userKnowledge[prereq.skill];
    if (!userLevel) return true;

    const levels = ['beginner', 'intermediate', 'advanced'];
    const requiredLevelIndex = levels.indexOf(prereq.level.toLowerCase());
    const userLevelIndex = levels.indexOf(userLevel.toLowerCase());

    return userLevelIndex < requiredLevelIndex;
  });

  return {
    satisfied: missing.length === 0,
    missing
  };
};

/**
 * Sorts prerequisites by importance and difficulty
 * @param {Array} prerequisites - Array of prerequisites
 * @returns {Array} - Sorted prerequisites
 */
export const sortPrerequisites = (prerequisites) => {
  if (!Array.isArray(prerequisites)) {
    return [];
  }

  const levelOrder = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  };

  return [...prerequisites].sort((a, b) => {
    // Sort by required level
    const levelDiff = levelOrder[a.level] - levelOrder[b.level];
    if (levelDiff !== 0) return levelDiff;

    // Then by estimated learning time
    return (a.estimatedLearningTime || 0) - (b.estimatedLearningTime || 0);
  });
};

/**
 * Finds common prerequisites between multiple roadmap items
 * @param {Array} items - Array of roadmap items
 * @returns {Array} - Common prerequisites
 */
export const findCommonPrerequisites = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  // Get prerequisites from first item
  const firstItemPrereqs = items[0].prerequisites || [];

  return firstItemPrereqs.filter(prereq => {
    // Check if prerequisite exists in all other items
    return items.every(item => {
      const itemPrereqs = item.prerequisites || [];
      return itemPrereqs.some(p =>
        p.skill === prereq.skill &&
        p.level === prereq.level
      );
    });
  });
};

/**
 * Creates a learning path for prerequisites
 * @param {Array} prerequisites - Array of prerequisites
 * @returns {Array} - Ordered learning path
 */
export const createPrerequisiteLearningPath = (prerequisites) => {
  if (!Array.isArray(prerequisites)) {
    return [];
  }

  const sorted = sortPrerequisites(prerequisites);

  // Group by level and estimate dependencies
  const levels = ['beginner', 'intermediate', 'advanced'];
  const path = [];

  for (const level of levels) {
    const levelPrereqs = sorted.filter(p => p.level === level);

    // Sort within level by estimated time (shorter first)
    levelPrereqs.sort((a, b) =>
      (a.estimatedLearningTime || 0) - (b.estimatedLearningTime || 0)
    );

    path.push(...levelPrereqs);
  }

  return path;
};

/**
 * Suggests additional prerequisites based on item content
 * @param {Object} item - Roadmap item
 * @returns {Array} - Suggested prerequisites
 */
export const suggestAdditionalPrerequisites = (item) => {
  if (!item || !item.description) {
    return [];
  }

  const suggestions = [];
  const description = item.description.toLowerCase();

  // Common programming prerequisites patterns
  if (description.includes('algorithm') || description.includes('data structure')) {
    suggestions.push({
      skill: 'Computer Science Fundamentals',
      level: 'intermediate',
      description: 'Understanding of basic algorithms and data structures',
      estimatedLearningTime: 40
    });
  }

  if (description.includes('api') || description.includes('rest')) {
    suggestions.push({
      skill: 'Web Development Basics',
      level: 'beginner',
      description: 'Basic understanding of HTTP and web services',
      estimatedLearningTime: 20
    });
  }

  // Add more patterns as needed

  return suggestions;
};
