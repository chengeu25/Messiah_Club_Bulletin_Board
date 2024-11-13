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
  onChange?: FormEventHandler<HTMLInputElement>;
  value?: string;
  checked?: boolean;
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
  onChange,
  value,
  checked
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
      className={`${generateStyleClasses(color ?? 'white', filled ?? true)
        .replace(`text-${color ?? 'white'}`, 'text-black')
        .replace(
          'w-full',
          type === 'checkbox' ? 'max-w-10' : 'w-full'
        )} p-2 rounded-lg flex-grow`}
      onInput={onInput}
      onChange={onChange}
      value={value}
      checked={checked}
    />
  </label>
);
export default Input;
