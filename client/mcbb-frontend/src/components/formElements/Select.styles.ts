import { StylesConfig, GroupBase } from 'react-select';

/**
 * Represents the structure of an option in a select dropdown
 *
 * @interface OptionType
 * @property {string} value - The underlying value of the option
 * @property {string} label - The display text for the option
 */
export interface OptionType {
  value: string;
  label: string;
}

/**
 * Custom styling configuration for the select component
 *
 * @function selectStyles
 * @param {boolean} useSchoolColors - Determines whether to use school color palette
 * @returns {StylesConfig<OptionType, false, GroupBase<OptionType>>} - Custom styles for the select component
 *
 * @description Defines styling for the select component
 *
 * @remarks
 * - Provides consistent styling across different interaction states
 * - Centers text for improved readability
 */
const selectStyles = (
  useSchoolColors: boolean
): StylesConfig<OptionType, false, GroupBase<OptionType>> => ({
  control: (base) => ({
    ...base,
    'backgroundColor': useSchoolColors ? 'var(--foreground-rgb)' : '#172554',
    'borderColor': 'white',
    'borderRadius': '10px',
    'borderWidth': '2px',
    'color': 'white',
    'textAlign': 'center', // Center the text
    'padding': '3px', // Add some padding
    '&:hover': {
      borderColor: 'white' // Change border color on hover
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white', // Text color for the selected value
    textAlign: 'center' // Center the selected value
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: useSchoolColors ? 'var(--foreground-rgb)' : '#172554',
    color: 'white'
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isFocused
      ? useSchoolColors
        ? 'var(--hover-rgb)'
        : '#1e40af'
      : isSelected
      ? useSchoolColors
        ? 'var(--active-rgb)'
        : '#1d4ed8'
      : useSchoolColors
      ? 'var(--foreground-rgb)'
      : '#172554',
    color: useSchoolColors ? 'var(--foreground-text-rgb)' : 'white',
    textAlign: 'center' // Center the option text
  })
});

export default selectStyles;
