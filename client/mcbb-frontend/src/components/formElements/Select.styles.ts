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
 * Custom styling configuration for react-select components
 *
 * Provides a consistent, dark-themed styling for select dropdowns
 * with centered text
 *
 * @type {StylesConfig<OptionType, false, GroupBase<OptionType>>}
 * @description Defines custom styles for different parts of the select component
 *
 * @example
 * <Select
 *   styles={selectStyles}
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 * />
 *
 * @remarks
 * - Provides hover and focus states for improved interactivity
 * - Ensures text is centered for a clean, uniform look
 */
const selectStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (base) => ({
    ...base,
    'backgroundColor': 'var(--foreground-rgb)',
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
    backgroundColor: 'var(--foreground-rgb)',
    color: 'white'
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isFocused
      ? 'var(--hover-rgb)'
      : isSelected
      ? 'var(--active-rgb)'
      : 'var(--foreground-rgb)',
    color: 'var(--foreground-text-rgb)',
    textAlign: 'center' // Center the option text
  })
};

export default selectStyles;
