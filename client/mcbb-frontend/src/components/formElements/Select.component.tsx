import generateStyleClasses from './styleGenerator';

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
