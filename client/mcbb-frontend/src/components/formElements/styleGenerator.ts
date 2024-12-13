/**
 * Generates dynamic Tailwind CSS classes for form elements based on color, fill state, and disabled status
 * 
 * @function generateStyleClasses
 * @param {string} color - The base color for the style (e.g., 'blue', 'red', 'green')
 * @param {boolean} filled - Determines whether the element should have a filled or outlined style
 * @param {boolean} [disabled] - Optional flag to apply disabled state styling
 * @returns {string} A string of Tailwind CSS classes for styling the form element
 * 
 * @example
 * // Filled blue button
 * const blueFilledClasses = generateStyleClasses('blue', true);
 * 
 * @example
 * // Outlined red button in disabled state
 * const redOutlinedDisabledClasses = generateStyleClasses('red', false, true);
 * 
 * @remarks
 * - Uses Tailwind's color scale for consistent styling
 * - Provides hover and active state variations
 * - Adjusts text and background colors based on fill and disabled states
 * - Supports a wide range of color options
 */
const generateStyleClasses = (
  color: string,
  filled: boolean,
  disabled?: boolean
) => {
  const baseClasses = 'p-2 rounded-lg w-full transition duration-200';
  const filledClasses = `bg-${color}-${
    disabled ? 800 : 950
  } hover:bg-${color}-900 active:bg-${color}-800 ${
    disabled ? 'text-gray-500' : 'text-white'
  }`;
  const outlinedClasses = `border-2 border-${color}-950 text-${color}-950 hover:text-${color}-900 hover:border-${color}-900 active:text-${color}-800 active:border-${color}-800`;

  return `${baseClasses} ${filled ? filledClasses : outlinedClasses}`;
};

export default generateStyleClasses;
