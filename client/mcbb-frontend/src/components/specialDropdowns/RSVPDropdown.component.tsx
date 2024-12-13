import CSelect, { StylesConfig, GroupBase } from 'react-select';
import { OptionType } from '../formElements/Select.styles';
import { useEffect, useState } from 'react';

/**
 * Custom styling configuration for the RSVP dropdown
 * 
 * @type {StylesConfig<OptionType, false, GroupBase<OptionType>>}
 * @description Defines a dark-themed, centered styling for the RSVP dropdown
 * 
 * @remarks
 * - Uses Tailwind's blue-950 color palette
 * - Provides consistent styling across different interaction states
 * - Centers text for improved readability
 */
const selectStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (base) => ({
    ...base,
    'backgroundColor': 'rgb(23, 37, 84)', // Tailwind's blue-950
    'border': 'none',
    'borderRadius': '8px',
    'width': '150px',
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

/**
 * Defines the properties for the RSVPDropdown component
 * 
 * @interface RSVPDropdownProps
 * @property {(type: string) => void} handleRSVPClick - Callback function to handle RSVP selection
 * @property {string} [initialValue] - Optional initial RSVP status
 */
interface RSVPDropdownProps {
  handleRSVPClick: (type: string) => void;
  initialValue?: string;
}

/**
 * Renders an interactive dropdown for event RSVP management
 * 
 * @component
 * @param {RSVPDropdownProps} props - The properties for the RSVPDropdown
 * @returns {JSX.Element} A styled dropdown for RSVP status selection
 * 
 * @example
 * <RSVPDropdown 
 *   handleRSVPClick={(type) => handleEventRSVP(type)} 
 *   initialValue="rsvp" 
 * />
 * 
 * @remarks
 * - Provides options: RSVP, Going, Not Going
 * - Confirms user's RSVP selection with a confirmation dialog
 * - Dynamically updates dropdown label based on current selection
 * - Supports initial RSVP status
 */
const RSVPDropdown = ({ handleRSVPClick, initialValue }: RSVPDropdownProps) => {
  /**
   * State to manage available RSVP options
   * @type {OptionType[]}
   */
  const [options, setOptions] = useState([
    { value: 'cancel', label: 'RSVP' },
    { value: 'rsvp', label: 'Going' },
    { value: 'block', label: 'Not Going' }
  ]);

  /**
   * State to track the currently selected RSVP option
   * @type {OptionType}
   */
  const [selectedRSVP, setSelectedRSVP] = useState<OptionType>(
    options.find((option) => option.value === initialValue) ?? options[0]
  );

  /**
   * State to track the previously selected RSVP option
   * @type {OptionType}
   */
  const [prevSelectedRSVP, setPrevSelectedRSVP] = useState<OptionType>(
    options.find((option) => option.value === initialValue) ?? options[0]
  );

  /**
   * Handles the RSVP dropdown change event
   * 
   * @param {string} type - The selected RSVP type
   * @description Confirms the user's selection, updates state, and triggers callback
   */
  const onRSVP = (type: string) => {
    const message = type === 'rsvp' ? 'yes' : type === 'block' ? 'no' : '';
    const shouldContinue = confirm(
      message === ''
        ? 'Are you sure you want to cancel your RSVP?'
        : `Are you sure you want to RSVP ${message} for this event?`
    );
    if (!shouldContinue) return;
    setSelectedRSVP(
      options.find((option) => option.value === type) ??
        options.find((option) => option.value === initialValue) ??
        options[0]
    );
    handleRSVPClick(type);
  };

  /**
   * Updates selected RSVP when initial value changes
   * @effect
   */
  useEffect(() => {
    setSelectedRSVP(
      options.find((option) => option.value === initialValue) ?? options[0]
    );
  }, [initialValue, options]);

  /**
   * Dynamically updates dropdown options based on selected RSVP
   * @effect
   */
  useEffect(() => {
    if (selectedRSVP.value === prevSelectedRSVP.value) return;
    setPrevSelectedRSVP(selectedRSVP);
    setOptions([
      {
        value: 'cancel',
        label: selectedRSVP.value === 'cancel' ? 'RSVP' : 'Cancel RSVP'
      },
      { value: 'rsvp', label: 'Going' },
      { value: 'block', label: 'Not Going' }
    ]);
  }, [selectedRSVP]);

  return (
    <CSelect
      options={options}
      defaultValue={{ value: '', label: 'RSVP' }}
      value={selectedRSVP}
      styles={selectStyles}
      onChange={(e) => (e !== null ? onRSVP(e.value) : null)}
      menuPortalTarget={document.body}
    />
  );
};

export default RSVPDropdown;
