/**
 * Enhanced roadmap generation logic for AI Roadmap Planner
 * Handles intelligent roadmap creation with prerequisites, dependencies, and phases
 */

import { validateDependencies } from '../dependencies';
import { checkPrerequisitesSatisfied } from '../prerequisites';
import { generatePhases, PHASE_TYPES } from './phaseGeneration';

/**
 * Difficulty levels for roadmap items and overall roadmap
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: { value: 1, label: 'Beginner', timeMultiplier: 1 },
  INTERMEDIATE: { value: 2, label: 'Intermediate', timeMultiplier: 1.5 },
  ADVANCED: { value: 3, label: 'Advanced', timeMultiplier: 2 },
  EXPERT: { value: 4, label: 'Expert', timeMultiplier: 2.5 }
};

/**
 * Gets difficulty level object from string
 * @param {string} level - Target level string
 * @returns {string} - Difficulty level key
 */
function getDifficultyLevel(level) {
  const normalizedLevel = level?.toUpperCase();
  return Object.keys(DIFFICULTY_LEVELS).find(
    key => key === normalizedLevel
  ) || 'BEGINNER';
}

/**
 * Generates an enhanced roadmap based on the given parameters
 * @param {Object} params - Generation parameters
 * @returns {Object} - Generated roadmap
 */
export const generateRoadmap = async ({
  field,
  targetLevel,
  timeConstraint,
  userPreferences,
  prerequisites = [],
  existingSkills = {}
}) => {
  try {
    // Generate main topics and skills
    const topics = await generateTopics(field, targetLevel);

    // Add prerequisite knowledge
    const enrichedTopics = addPrerequisiteKnowledge(topics, prerequisites);

    // Validate prerequisites against user's existing skills
    const prerequisiteCheck = checkPrerequisitesSatisfied(
      enrichedTopics.prerequisites,
      existingSkills
    );

    if (!prerequisiteCheck.satisfied) {
      enrichedTopics.missingPrerequisites = prerequisiteCheck.missing;
    }

    // Generate learning path with dependencies
    const learningPath = generateLearningPath(enrichedTopics, {
      targetLevel,
      timeConstraint
    });

    // Validate dependency structure
    const dependencyValidation = validateDependencies(learningPath.items);
    if (!dependencyValidation.valid) {
      throw new Error('Invalid dependency structure: ' + dependencyValidation.errors.join(', '));
    }

    // Generate phases with proper organization
    const phases = generatePhases(learningPath.items, {
      maxItemsPerPhase: userPreferences.maxItemsPerPhase || 5,
      preferredDifficulty: getDifficultyLevel(targetLevel),
      timeConstraint: timeConstraint
    });

    // Calculate estimated durations
    const durations = calculateDurations(phases, {
      difficultyLevel: getDifficultyLevel(targetLevel),
      timeConstraint,
      userPreferences
    });

    // Generate recommendations
    const recommendations = generateRecommendations(field, targetLevel, learningPath);

    return {
      metadata: {
        field,
        targetLevel,
        generatedAt: new Date().toISOString(),
        estimatedDuration: durations.total,
        difficulty: getDifficultyLevel(targetLevel),
        prerequisites: enrichedTopics.prerequisites,
        missingPrerequisites: enrichedTopics.missingPrerequisites || []
      },
      phases: phases.map((phase, index) => ({
        ...phase,
        estimatedDuration: durations.byPhase[index],
        recommendations: recommendations.byPhase[index] || []
      })),
      recommendations: recommendations.general,
      validations: {
        dependencies: dependencyValidation,
        prerequisites: prerequisiteCheck
      }
    };
  } catch (_error) {
    console.error('Error generating roadmap:', error);
    throw new Error('Failed to generate roadmap: ' + error.message);
  }
};

/**
 * Generates main topics for the roadmap based on field and level
 * @param {string} field - Target field
 * @param {string} targetLevel - Target expertise level
 * @returns {Array} - Generated topics
 */
async function generateTopics(field, targetLevel) {
  // This would integrate with the AI service to generate topics
  // For now, returning a placeholder structure
  return {
    topics: [
      {
        id: 'foundations',
        title: 'Foundational Concepts',
        description: 'Core concepts and principles',
        difficulty: DIFFICULTY_LEVELS.BEGINNER.value,
        estimatedDuration: 10
      },
      // More topics would be generated here
    ],
    prerequisites: []
  };
}

/**
 * Adds prerequisite knowledge to topics
 * @param {Object} topics - Generated topics
 * @param {Array} prerequisites - User-defined prerequisites
 * @returns {Object} - Enriched topics with prerequisites
 */
function addPrerequisiteKnowledge(topics, prerequisites) {
  return {
    ...topics,
    prerequisites: [
      ...topics.prerequisites,
      ...prerequisites
    ].filter((p, index, self) =>
      index === self.findIndex(t => t.skill === p.skill)
    )
  };
}

/**
 * Generates a learning path with proper dependencies
 * @param {Object} topics - Topics with prerequisites
 * @param {Object} options - Generation options
 * @returns {Object} - Organized learning path
 */
function generateLearningPath(topics, options) {
  const { targetLevel, timeConstraint } = options;

  // Organize topics into a logical learning path
  // This would include dependency mapping and order optimization
  return {
    items: topics.topics.map(topic => ({
      ...topic,
      dependencies: [], // Would be populated based on topic relationships
      prerequisites: [] // Would be populated based on required knowledge
    }))
  };
}

/**
 * Calculates estimated durations for phases and overall roadmap
 * @param {Array} phases - Generated phases
 * @param {Object} options - Calculation options
 * @returns {Object} - Duration calculations
 */
function calculateDurations(phases, options) {
  const { difficultyLevel, timeConstraint, userPreferences } = options;
  const timeMultiplier = DIFFICULTY_LEVELS[difficultyLevel]?.timeMultiplier || 1;

  const byPhase = phases.map(phase => {
    const baseTime = phase.items.reduce((total, item) =>
      total + (item.estimatedDuration || 0), 0);
    return Math.ceil(baseTime * timeMultiplier);
  });

  return {
    total: byPhase.reduce((a, b) => a + b, 0),
    byPhase
  };
}

/**
 * Generates recommendations for the roadmap
 * @param {string} field - Target field
 * @param {string} targetLevel - Target expertise level
 * @param {Object} learningPath - Generated learning path
 * @returns {Object} - Recommendations
 */
function generateRecommendations(field, targetLevel, learningPath) {
  // This would integrate with the AI service to generate targeted recommendations
  return {
    general: [
      {
        type: 'resource',
        title: 'Recommended Learning Resources',
        items: []
      },
      {
        type: 'project',
        title: 'Suggested Projects',
        items: []
      }
    ],
    byPhase: []
  };
}


/**
 * Validates the generated roadmap
 * @param {Object} roadmap - Generated roadmap
 * @returns {Object} - Validation results
 */
export const validateRoadmap = (roadmap) => {
  const errors = [];

  if (!roadmap.metadata) errors.push('Missing metadata');
  if (!Array.isArray(roadmap.phases)) errors.push('Missing phases');
  if (!roadmap.recommendations) errors.push('Missing recommendations');

  return {
    valid: errors.length === 0,
    errors
  };
};
