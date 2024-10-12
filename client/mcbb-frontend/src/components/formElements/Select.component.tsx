import generateStyleClasses from './styleGenerator.function';
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
}

const Select = ({
  color,
  onChange,
  name,
  filled = true,
  options,
  label
}: SelectProps) => (
  <label className='flex flex-row items-center text-nowrap gap-2'>
    <span>{label}</span>
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
