# Mini-Goal Click Behavior & URL Validation Fixes

## Changes Made

### 1. Fixed Mini-Goal Title Click Behavior
**Issue**: Previously, clicking on mini-goal titles would toggle completion status regardless of whether they had URLs.

**Fix**: 
- Mini-goal titles with URLs now function as proper links that open in new tabs
- Only mini-goal titles WITHOUT URLs can be clicked to toggle completion
- Links prevent event propagation to avoid triggering completion toggle
- Cursor styling is conditional:
  - `cursor: pointer` for clickable titles (no URL)
  - `cursor: default` for titles with links

### 2. Fixed Checkbox Auto-Expansion Issue
**Issue**: Clicking checkboxes would automatically expand collapsed phases.

**Fix**:
- Removed auto-expansion behavior from completion toggle
- Checkboxes now only toggle completion status without expanding phases
- Users must manually expand phases to see mini-goals
- Cleaner separation of concerns between completion tracking and UI state

### 3. Enhanced URL Validation in AI Prompts
**Issue**: AI-generated URLs were often placeholder/non-functional links.

**Fix**: Updated prompts with comprehensive URL validation requirements:
- URLs must be real, existing, and accessible websites
- No 404 or error pages allowed
- Must be from reputable sources (GitHub, official docs, MDN, W3Schools, FreeCodeCamp, etc.)
- Never use placeholder URLs like "example.com"
- If uncertain about URL validity, omit the field entirely
- Clear instructions to only include verified working URLs

## Technical Details

### Code Changes
- **File**: `src/hooks/useRoadmap.js`
- **Lines modified**: 1404-1452 (mini-goal rendering), 1940-1980 (prompt generation)

### New Behavior
1. **With URL**: Click title → Opens link in new tab
2. **Without URL**: Click title → Toggles completion
3. **Checkbox**: Click → Only toggles completion (no expansion)
4. **Phase header**: Click → Expands/collapses phase

### Benefits
- Better user experience with intuitive click behaviors
- Functional URLs that actually work
- Cleaner UI interactions
- Separation of navigation vs. completion tracking
