import generateStyleClasses from './styleGenerator';
import { FormEventHandler } from 'react';

interface InputProps {
  label: string;
  name: string;
  type: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray' | 'white';
  filled?: boolean;
  placeholder?: string;
  required?: boolean;
  onInput?: FormEventHandler<HTMLInputElement>;
  value?: string;
}

const Input = ({
  label,
  name,
  type,
  color,
  filled,
  placeholder = '',
  required = false,
  onInput,
  value
}: InputProps) => (
  <label className='flex flex-row items-center gap-2 text-nowrap flex-grow'>
    <span>
      {label}
      {required && <span className='text-red-500'>*</span>}
    </span>
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
      onInput={onInput}
      value={value}
    />
  </label>
);
export default Input;
