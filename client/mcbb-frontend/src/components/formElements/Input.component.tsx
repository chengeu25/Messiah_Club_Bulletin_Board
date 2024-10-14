import generateStyleClasses from './styleGenerator.function';

interface InputProps {
  label: string;
  name: string;
  type: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray' | 'white';
  filled?: boolean;
  placeholder?: string;
  required?: boolean;
}

const Input = ({
  label,
  name,
  type,
  color,
  filled,
  placeholder = '',
  required = false
}: InputProps) => (
  <label className='flex flex-row items-center gap-2 text-nowrap'>
    <span>{label}</span>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={`${generateStyleClasses(
        color ?? 'white',
        filled ?? true
      ).replace(
        `text-${color ?? 'white'}`,
        'text-black'
      )} p-2 rounded-lg flex-grow`}
      required={required}
    />
  </label>
);
export default Input;
