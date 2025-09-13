/**
 * Phase generation utility for AI Roadmap Planner
 * Handles intelligent grouping and organization of roadmap phases
 */

/**
 * Phase types for different learning stages
 */
export const PHASE_TYPES = {
  FOUNDATION: 'foundation',    // Basic concepts and prerequisites
  CORE: 'core',               // Main concepts and skills
  ADVANCED: 'advanced',        // Advanced topics
  SPECIALIZATION: 'specialization', // Specific focus areas
  PRACTICAL: 'practical',      // Hands-on projects and applications
  MASTERY: 'mastery'          // Expert-level concepts
};

/**
 * Phase difficulty levels
 */
export const PHASE_DIFFICULTY = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4
};

/**
 * Generates phases based on roadmap items
 * @param {Array} items - Array of roadmap items
 * @param {Object} options - Configuration options
 * @returns {Array} - Generated phases
 */
export const generatePhases = (items, options = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const {
    maxItemsPerPhase = 5,
    preferredDifficulty = PHASE_DIFFICULTY.INTERMEDIATE,
    timeConstraint = null // in hours
  } = options;

  // Group items by difficulty and dependencies
  const groupedItems = groupItemsByComplexity(items);

  // Initialize phases
  const phases = [];
  let currentPhase = {
    id: crypto.randomUUID(),
    title: '',
    type: '',
    items: [],
    difficulty: 0,
    estimatedDuration: 0,
    objectives: []
  };

  // Process each difficulty level
  Object.entries(groupedItems).forEach(([difficulty, levelItems]) => {
    const phaseType = determinePhaseType(Number(difficulty), preferredDifficulty);

    levelItems.forEach(item => {
      // Check if we need to start a new phase
      if (shouldStartNewPhase(currentPhase, item, maxItemsPerPhase, timeConstraint)) {
        if (currentPhase.items.length > 0) {
          finalizePhase(currentPhase);
          phases.push(currentPhase);
        }

        currentPhase = createNewPhase(phaseType, Number(difficulty));
      }

      currentPhase.items.push(item);
      currentPhase.estimatedDuration += item.duration || 0;
      updatePhaseObjectives(currentPhase, item);
    });
  });

  // Add the last phase if it has items
  if (currentPhase.items.length > 0) {
    finalizePhase(currentPhase);
    phases.push(currentPhase);
  }

  return optimizePhases(phases, timeConstraint);
};

/**
 * Groups items by their complexity level
 * @param {Array} items - Array of roadmap items
 * @returns {Object} - Items grouped by difficulty
 */
const groupItemsByComplexity = (items) => {
  return items.reduce((groups, item) => {
    const difficulty = item.difficulty || PHASE_DIFFICULTY.BEGINNER;
    if (!groups[difficulty]) {
      groups[difficulty] = [];
    }
    groups[difficulty].push(item);
    return groups;
  }, {});
};

/**
 * Determines the phase type based on difficulty
 * @param {number} difficulty - Current difficulty level
 * @param {number} preferredDifficulty - User's preferred difficulty
 * @returns {string} - Phase type
 */
const determinePhaseType = (difficulty, preferredDifficulty) => {
  if (difficulty < preferredDifficulty) {
    return PHASE_TYPES.FOUNDATION;
  } else if (difficulty === preferredDifficulty) {
    return PHASE_TYPES.CORE;
  } else if (difficulty === PHASE_DIFFICULTY.ADVANCED) {
    return PHASE_TYPES.ADVANCED;
  } else {
    return PHASE_TYPES.MASTERY;
  }
};

/**
 * Checks if a new phase should be started
 * @param {Object} currentPhase - Current phase
 * @param {Object} newItem - Item to be added
 * @param {number} maxItems - Maximum items per phase
 * @param {number} timeConstraint - Time constraint in hours
 * @returns {boolean} - Whether to start a new phase
 */
const shouldStartNewPhase = (currentPhase, newItem, maxItems, timeConstraint) => {
  if (currentPhase.items.length === 0) return false;

  const wouldExceedMaxItems = currentPhase.items.length >= maxItems;
  const wouldExceedTimeConstraint = timeConstraint &&
    (currentPhase.estimatedDuration + (newItem.duration || 0)) > timeConstraint;

  return wouldExceedMaxItems || wouldExceedTimeConstraint;
};

/**
 * Creates a new phase
 * @param {string} type - Phase type
 * @param {number} difficulty - Phase difficulty
 * @returns {Object} - New phase object
 */
const createNewPhase = (type, difficulty) => ({
  id: crypto.randomUUID(),
  title: `${type.charAt(0).toUpperCase() + type.slice(1)} Phase`,
  type,
  items: [],
  difficulty,
  estimatedDuration: 0,
  objectives: []
});

/**
 * Updates phase objectives based on items
 * @param {Object} phase - Current phase
 * @param {Object} item - New item
 */
const updatePhaseObjectives = (phase, item) => {
  if (item.objectives) {
    phase.objectives = [...new Set([...phase.objectives, ...item.objectives])];
  }
};

/**
 * Finalizes a phase by updating its metadata
 * @param {Object} phase - Phase to finalize
 */
const finalizePhase = (phase) => {
  // Calculate average difficulty
  const avgDifficulty = phase.items.reduce((sum, item) => sum + (item.difficulty || 1), 0) / phase.items.length;
  phase.difficulty = Math.round(avgDifficulty);

  // Generate descriptive title
  phase.title = generatePhaseTitle(phase);

  // Sort objectives by importance
  phase.objectives.sort((a, b) => {
    const aImportance = countObjectiveReferences(a, phase.items);
    const bImportance = countObjectiveReferences(b, phase.items);
    return bImportance - aImportance;
  });
};

/**
 * Generates a descriptive title for a phase
 * @param {Object} phase - The phase
 * @returns {string} - Generated title
 */
const generatePhaseTitle = (phase) => {
  const typeTitle = phase.type.charAt(0).toUpperCase() + phase.type.slice(1);
  const commonKeywords = extractCommonKeywords(phase.items);

  if (commonKeywords.length > 0) {
    return `${typeTitle}: ${commonKeywords.slice(0, 2).join(' & ')}`;
  }

  return `${typeTitle} Phase ${phase.difficulty}`;
};

/**
 * Extracts common keywords from items
 * @param {Array} items - Phase items
 * @returns {Array} - Common keywords
 */
const extractCommonKeywords = (items) => {
  const keywords = {};

  items.forEach(item => {
    const words = (item.title + ' ' + item.description)
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3);

    words.forEach(word => {
      keywords[word] = (keywords[word] || 0) + 1;
    });
  });

  return Object.entries(keywords)
    .filter(([_, count]) => count > 1)
    .sort(([_, a], [__, b]) => b - a)
    .map(([word]) => word);
};

/**
 * Counts how many times an objective is referenced in items
 * @param {string} objective - The objective
 * @param {Array} items - Phase items
 * @returns {number} - Reference count
 */
const countObjectiveReferences = (objective, items) => {
  return items.reduce((count, item) => {
    const itemText = (item.title + ' ' + item.description).toLowerCase();
    return count + (itemText.includes(objective.toLowerCase()) ? 1 : 0);
  }, 0);
};

/**
 * Optimizes phases based on time constraints
 * @param {Array} phases - Generated phases
 * @param {number} timeConstraint - Time constraint in hours
 * @returns {Array} - Optimized phases
 */
const optimizePhases = (phases, timeConstraint) => {
  if (!timeConstraint) return phases;

  let optimizedPhases = [...phases];

  // Merge small phases if possible
  for (let i = 0; i < optimizedPhases.length - 1; i++) {
    const currentPhase = optimizedPhases[i];
    const nextPhase = optimizedPhases[i + 1];

    if (currentPhase.estimatedDuration + nextPhase.estimatedDuration <= timeConstraint &&
        Math.abs(currentPhase.difficulty - nextPhase.difficulty) <= 1) {
      // Merge phases
      currentPhase.items = [...currentPhase.items, ...nextPhase.items];
      currentPhase.estimatedDuration += nextPhase.estimatedDuration;
      currentPhase.objectives = [...new Set([...currentPhase.objectives, ...nextPhase.objectives])];

      // Remove next phase
      optimizedPhases.splice(i + 1, 1);

      // Reprocess the current phase
      finalizePhase(currentPhase);
      i--;
    }
  }

  return optimizedPhases;
};
