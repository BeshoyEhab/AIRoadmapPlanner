/**
 * Dependencies management utility for AI Roadmap Planner
 */

/**
 * Dependency types enum
 */
export const DEPENDENCY_TYPES = {
  REQUIRED: 'required',     // Must be completed before starting
  RECOMMENDED: 'recommended', // Should be completed before starting
  PARALLEL: 'parallel',     // Can be learned alongside
  OPTIONAL: 'optional'      // Nice to have but not necessary
};

/**
 * Validates a dependency object
 * @param {Object} dependency - The dependency to validate
 * @returns {boolean} - Whether the dependency is valid
 */
export const validateDependency = (dependency) => {
  if (!dependency || typeof dependency !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'type', 'reason'];
  return requiredFields.every(field => dependency[field] !== undefined) &&
         Object.values(DEPENDENCY_TYPES).includes(dependency.type);
};

/**
 * Checks for circular dependencies in a roadmap
 * @param {Array} items - Array of roadmap items
 * @returns {Object} - Contains whether circular dependencies exist and the path if they do
 */
export const checkCircularDependencies = (items) => {
  if (!Array.isArray(items)) {
    return { hasCircular: false, path: [] };
  }

  const graph = new Map();
  items.forEach(item => {
    graph.set(item.id, item.dependencies?.map(d => d.id) || []);
  });

  const visited = new Set();
  const recursionStack = new Set();
  const circularPath = [];

  const dfs = (nodeId) => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const dependencies = graph.get(nodeId) || [];
    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (dfs(depId)) {
          circularPath.unshift(depId);
          return true;
        }
      } else if (recursionStack.has(depId)) {
        circularPath.unshift(depId);
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const item of items) {
    if (!visited.has(item.id)) {
      if (dfs(item.id)) {
        circularPath.unshift(item.id);
        return { hasCircular: true, path: circularPath };
      }
    }
  }

  return { hasCircular: false, path: [] };
};

/**
 * Gets all dependencies for an item including transitive dependencies
 * @param {string} itemId - The item ID to get dependencies for
 * @param {Array} items - Array of all roadmap items
 * @returns {Object} - Dependencies grouped by type
 */
export const getAllDependencies = (itemId, items) => {
  if (!itemId || !Array.isArray(items)) {
    return {};
  }

  const result = {
    required: new Set(),
    recommended: new Set(),
    parallel: new Set(),
    optional: new Set()
  };

  const processed = new Set();

  const processDependencies = (id) => {
    if (processed.has(id)) return;
    processed.add(id);

    const item = items.find(i => i.id === id);
    if (!item || !Array.isArray(item.dependencies)) return;

    item.dependencies.forEach(dep => {
      result[dep.type].add(dep.id);
      processDependencies(dep.id); // Process transitive dependencies
    });
  };

  processDependencies(itemId);

  // Convert Sets to Arrays
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [key, Array.from(value)])
  );
};

/**
 * Creates a dependency graph for visualization
 * @param {Array} items - Array of roadmap items
 * @returns {Object} - Graph data structure
 */
export const createDependencyGraph = (items) => {
  if (!Array.isArray(items)) {
    return { nodes: [], edges: [] };
  }

  const nodes = items.map(item => ({
    id: item.id,
    label: item.title,
    data: {
      description: item.description,
      duration: item.duration,
      difficulty: item.difficulty
    }
  }));

  const edges = [];
  items.forEach(item => {
    if (Array.isArray(item.dependencies)) {
      item.dependencies.forEach(dep => {
        edges.push({
          from: dep.id,
          to: item.id,
          type: dep.type,
          data: {
            reason: dep.reason
          }
        });
      });
    }
  });

  return { nodes, edges };
};

/**
 * Orders items based on dependencies
 * @param {Array} items - Array of roadmap items
 * @returns {Array} - Ordered array of items
 */
export const orderByDependencies = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const graph = new Map();
  const inDegree = new Map();

  // Initialize graphs
  items.forEach(item => {
    graph.set(item.id, []);
    inDegree.set(item.id, 0);
  });

  // Build dependency graph
  items.forEach(item => {
    if (Array.isArray(item.dependencies)) {
      item.dependencies.forEach(dep => {
        if (dep.type === DEPENDENCY_TYPES.REQUIRED) {
          graph.get(dep.id).push(item.id);
          inDegree.set(item.id, inDegree.get(item.id) + 1);
        }
      });
    }
  });

  // Topological sort
  const queue = [];
  const result = [];

  // Find all starting nodes (no dependencies)
  items.forEach(item => {
    if (inDegree.get(item.id) === 0) {
      queue.push(item.id);
    }
  });

  while (queue.length > 0) {
    const currentId = queue.shift();
    result.push(currentId);

    graph.get(currentId).forEach(neighborId => {
      inDegree.set(neighborId, inDegree.get(neighborId) - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(neighborId);
      }
    });
  }

  // Map IDs back to items
  return result.map(id => items.find(item => item.id === id));
};

/**
 * Suggests dependencies based on item content and existing dependencies
 * @param {Object} item - The item to suggest dependencies for
 * @param {Array} allItems - All roadmap items
 * @returns {Array} - Suggested dependencies
 */
export const suggestDependencies = (item, allItems) => {
  if (!item || !Array.isArray(allItems)) {
    return [];
  }

  const suggestions = [];
  const itemKeywords = new Set(
    (item.title + ' ' + item.description)
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
  );

  const existingDependencies = new Set(
    item.dependencies?.map(d => d.id) || []
  );

  allItems.forEach(otherItem => {
    if (otherItem.id === item.id || existingDependencies.has(otherItem.id)) {
      return;
    }

    const otherKeywords = new Set(
      (otherItem.title + ' ' + otherItem.description)
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 3)
    );

    // Calculate keyword overlap
    const overlap = [...itemKeywords].filter(word => otherKeywords.has(word)).length;
    const overlapScore = overlap / Math.min(itemKeywords.size, otherKeywords.size);

    if (overlapScore > 0.3) { // Threshold for suggestion
      suggestions.push({
        id: otherItem.id,
        type: DEPENDENCY_TYPES.RECOMMENDED,
        reason: `Similar content overlap (${Math.round(overlapScore * 100)}% match)`,
        score: overlapScore
      });
    }
  });

  return suggestions.sort((a, b) => b.score - a.score);
};

/**
 * Validates all dependencies in a roadmap
 * @param {Array} items - Array of roadmap items
 * @returns {Object} - Validation results
 */
export const validateDependencies = (items) => {
  if (!Array.isArray(items)) {
    return { valid: false, errors: ['Invalid items array'] };
  }

  const errors = [];
  const itemIds = new Set(items.map(item => item.id));

  // Check for missing referenced items
  items.forEach(item => {
    if (Array.isArray(item.dependencies)) {
      item.dependencies.forEach(dep => {
        if (!itemIds.has(dep.id)) {
          errors.push(`Item ${item.id} references non-existent dependency ${dep.id}`);
        }
      });
    }
  });

  // Check for circular dependencies
  const { hasCircular, path } = checkCircularDependencies(items);
  if (hasCircular) {
    errors.push(`Circular dependency detected: ${path.join(' → ')}`);
  }

  // Validate each dependency object
  items.forEach(item => {
    if (Array.isArray(item.dependencies)) {
      item.dependencies.forEach(dep => {
        if (!validateDependency(dep)) {
          errors.push(`Invalid dependency in item ${item.id}: ${JSON.stringify(dep)}`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};
