import CSelect, { StylesConfig, GroupBase } from 'react-select';
import { OptionType } from '../formElements/Select.styles';
import { useEffect, useState } from 'react';

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

interface RSVPDropdownProps {
  handleRSVPClick: (type: string) => void;
  initialValue?: string;
}

/**
 * Renders a dropdown for the user to RSVP to an event
 */
const RSVPDropdown = ({ handleRSVPClick, initialValue }: RSVPDropdownProps) => {
  const [options, setOptions] = useState([
    { value: 'cancel', label: 'RSVP' },
    { value: 'rsvp', label: 'Going' },
    { value: 'block', label: 'Not Going' }
  ]);

  const [selectedRSVP, setSelectedRSVP] = useState<OptionType>(
    options.find((option) => option.value === initialValue) ?? options[0]
  );

  const [prevSelectedRSVP, setPrevSelectedRSVP] = useState<OptionType>(
    options.find((option) => option.value === initialValue) ?? options[0]
  );

  /**
   * Handles the RSVP dropdown change event.Checks to confirm, sets the state accordingly
   * if confirmed, and passes to the handleRSVPClick function
   * @param {OptionType | null} selected - The selected option.
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

  useEffect(() => {
    setSelectedRSVP(
      options.find((option) => option.value === initialValue) ?? options[0]
    );
  }, [initialValue, options]);

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
