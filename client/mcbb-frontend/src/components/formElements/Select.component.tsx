import generateStyleClasses from './styleGenerator';

/**
 * Represents the properties for the Select component
 *
 * @interface SelectProps
 * @property {string} color - The color theme of the select input
 * @property {(e?: React.ChangeEvent<HTMLSelectElement>) => void} [onChange] - Optional change event handler
 * @property {boolean} [filled=true] - Determines if the select is filled or outlined
 * @property {string} [name] - Optional name attribute for the select
 * @property {string[]} options - Array of options to be displayed in the select
 * @property {string} label - The label text for the select input
 * @property {boolean} [required] - Makes the select input required
 * @property {string} [className] - Additional CSS classes to apply to the select
 */
interface SelectProps {
  color:
    | 'red'
    | 'blue'
    | 'green'
    | 'yellow'
    | 'purple'
    | 'orange'
    | 'gray'
    | 'white';

  onChange?: (e?: React.ChangeEvent<HTMLSelectElement>) => void;
  filled?: boolean;
  name?: string;
  options: string[];
  label: string;
  required?: boolean;
  className?: string;
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
 *   color="blue"
 *   options={['Red', 'Green', 'Blue']}
 *   onChange={(e) => handleColorChange(e)}
 *   required={true}
 * />
 */
const Select = ({
  color,
  onChange,
  name,
  filled = true,
  options,
  label,
  required,
  className
}: SelectProps) => (
  <label className='flex flex-col text-nowrap gap-2'>
    {label && (
      <span>
        {label}
        {required && <span className='text-red-500'>*</span>}
      </span>
    )}
    <select
      className={`${generateStyleClasses(
        color,
        filled
      )} ${className} bg-transparent`}
      onChange={onChange}
      name={name}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default Select;
