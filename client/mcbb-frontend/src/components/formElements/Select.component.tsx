import generateStyleClasses from './styleGenerator';
import { useLocation } from 'react-router-dom';

/**
 * Represents the properties for the Select component
 *
 * @interface SelectProps
 * @property {(e?: React.ChangeEvent<HTMLSelectElement>) => void} [onChange] - Optional change event handler
 * @property {boolean} [filled=true] - Determines if the select is filled or outlined
 * @property {string} [name] - Optional name attribute for the select
 * @property {string[]} options - Array of options to be displayed in the select
 * @property {string} label - The label text for the select input
 * @property {boolean} [required] - Makes the select input required
 * @property {string} [className] - Additional CSS classes to apply to the select
 * @property {string} [value] - Controlled select value
 */
interface SelectProps {
  onChange?: (e?: React.ChangeEvent<HTMLSelectElement>) => void;
  filled?: boolean;
  name?: string;
  options: string[];
  label: string;
  required?: boolean;
  className?: string;
  value?: string;
}

/**
 * A customizable select input component with styling and label support
 *
 * @component
 * @param {SelectProps} props - The properties for the Select component
 * @returns {JSX.Element} A styled select input with optional label and required indicator
 *
 * @example
 * <Select
 *   label="Choose a color"
 *   options={['Red', 'Green', 'Blue']}
 *   onChange={(e) => handleColorChange(e)}
 *   required={true}
 * />
 */
const Select = ({
  onChange,
  name,
  filled = true,
  options,
  label,
  required,
  className,
  value
}: SelectProps) => {
  const location = useLocation();

  return (
    <label className='flex flex-col text-nowrap gap-2'>
      {label && (
        <span>
          {label}
          {required && <span className='text-red-500'>*</span>}
        </span>
      )}
      <select
        className={`${generateStyleClasses(
          filled,
          false,
          location.pathname !== '/'
        )} ${className} bg-transparent`}
        onChange={onChange}
        name={name}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Select;
