import { StylesConfig, GroupBase } from 'react-select';

export interface OptionType {
  value: string;
  label: string;
}

const selectStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (base) => ({
    ...base,
    'backgroundColor': 'rgb(23, 37, 84)', // Tailwind's blue-950
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
    backgroundColor: 'rgb(23, 37, 84)', // Tailwind's blue-950 for dropdown
    color: 'white'
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isFocused
      ? 'rgb(43, 57, 104)'
      : isSelected
      ? 'rgb(43, 57, 104)'
      : 'rgb(23, 37, 84)',
    color: 'white',
    textAlign: 'center' // Center the option text
  })
};

export default selectStyles;
