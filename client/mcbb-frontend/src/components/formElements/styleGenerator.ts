/**
 * Generates dynamic Tailwind CSS classes for form elements based on color, fill state, and disabled status
 *
 * @function generateStyleClasses
 * @param {boolean} filled - Determines whether the element should have a filled or outlined style
 * @param {boolean} [disabled] - Optional flag to apply disabled state styling
 * @param {boolean} [useSchoolColor] - Optional flag to use school color palette, true by default
 * @returns {string} A string of Tailwind CSS classes for styling the form element
 *
 * @remarks
 * - Uses Tailwind's color scale for consistent styling
 * - Provides hover and active state variations
 * - Adjusts text and background colors based on fill and disabled states
 * - Supports a wide range of color options
 */
const generateStyleClasses = (
  filled: boolean,
  disabled: boolean = false,
  useSchoolColor: boolean = true
) => {
  const baseClasses = 'p-2 rounded-lg w-full transition duration-200';
  const filledClasses = `${
    useSchoolColor
      ? 'foreground-filled-focusable'
      : 'bg-blue-950 hover:bg-blue-800 active:bg-blue-700 focus:bg-blue-800'
  } ${disabled ? 'text-gray-500' : 'text-white'}`;
  const outlinedClasses = `border-2 ${
    useSchoolColor
      ? 'foreground-outlined-focusable'
      : 'border-blue-950 hover:border-blue-800 active:border-blue-700 focus:border-blue-800'
  } ${disabled ? 'text-gray-500' : 'foreground-outlined-focusable'}`;

  return `${baseClasses} ${filled ? filledClasses : outlinedClasses}`;
};

export default generateStyleClasses;
