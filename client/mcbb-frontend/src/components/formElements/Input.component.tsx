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
  onInput?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  value?: string;
  checked?: boolean;
  defaultValue?: string;
  multiline?: boolean;
  accept?: string;
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
  checked,
  defaultValue,
  multiline = false,
  accept
}: InputProps) => (
  <label
    className={`flex ${
      type === 'checkbox' ? 'flex-row items-center' : 'flex-col'
    } gap-2 text-nowrap flex-grow`}
  >
    {label && (
      <span>
        {label}
        {required && <span className='text-red-500'>*</span>}
      </span>
    )}
    {multiline ? (
      <textarea
        name={name}
        placeholder={placeholder}
        className={`${generateStyleClasses(color ?? 'white', filled ?? true)
          .replace(`text-${color ?? 'white'}`, 'text-black')
          .replace(
            'w-full',
            type === 'checkbox' ? 'max-w-10' : 'w-full'
          )} p-2 rounded-lg flex-grow text-black`}
        defaultValue={defaultValue}
        onInput={onInput}
        onChange={onChange}
        value={value}
      ></textarea>
    ) : (
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={`${generateStyleClasses(color ?? 'white', filled ?? true)
          .replace(`text-${color ?? 'white'}`, 'text-black')
          .replace(`text-white`, 'text-black')
          .replace(
            'w-full',
            type === 'checkbox' ? 'max-w-10' : 'w-full'
          )} p-2 rounded-lg flex-grow ${!filled && 'text-black'}`}
        onInput={onInput}
        onChange={onChange}
        value={value}
        checked={checked}
        defaultValue={defaultValue}
        accept={accept}
      />
    )}
  </label>
);
export default Input;
