import generateStyleClasses from './styleGenerator';
import './Select.component.module.css';

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

  onChange?: () => void;
  filled?: boolean;
  name?: string;
  options: string[];
  label: string;
  required?: boolean;
}

const Select = ({
  color,
  onChange,
  name,
  filled = true,
  options,
  label,
  required
}: SelectProps) => (
  <label className='flex flex-row items-center text-nowrap gap-2'>
    <span>
      {label}
      {required && <span className='text-red-500'>*</span>}
    </span>
    <select
      className={`${generateStyleClasses(color, filled)} bg-transparent`}
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
