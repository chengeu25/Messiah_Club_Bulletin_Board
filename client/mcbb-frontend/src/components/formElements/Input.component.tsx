import generateStyleClasses from './styleGenerator';
import { FormEventHandler } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Represents the properties for the Input component
 *
 * @interface InputProps
 * @property {string} label - The label text for the input
 * @property {string} name - The name attribute for the input
 * @property {string} type - The type of input (e.g., 'text', 'checkbox', 'file')
 * @property {boolean} [filled=true] - Determines if the input is filled or outlined
 * @property {string} [placeholder=''] - Optional placeholder text
 * @property {boolean} [required=false] - Makes the input required
 * @property {FormEventHandler<HTMLInputElement | HTMLTextAreaElement>} [onInput] - Event handler for input events
 * @property {FormEventHandler<HTMLInputElement | HTMLTextAreaElement>} [onChange] - Event handler for change events
 * @property {string} [value] - Controlled input value
 * @property {boolean} [checked] - Checkbox checked state
 * @property {string} [defaultValue] - Default value for uncontrolled inputs
 * @property {boolean} [multiline=false] - Renders a textarea instead of an input
 * @property {string} [accept] - Accepted file types for file inputs
 * @property {boolean} [multiple=false] - Allows multiple file selection
 * @property {boolean} [labelOnSameLine=false] - Places label on the same line as input
 */
interface InputProps {
  label: string;
  name: string;
  type: string;
  filled?: boolean;
  placeholder?: string;
  required?: boolean;
  onInput?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  autoComplete?: string;
  value?: string;
  checked?: boolean;
  defaultValue?: string | number;
  multiline?: boolean;
  accept?: string;
  multiple?: boolean;
  labelOnSameLine?: boolean;
  min?: number;
  max?: number;
}

/**
 * A flexible and customizable input component supporting various input types
 *
 * @component
 * @param {InputProps} props - The properties for the Input component
 * @returns {JSX.Element} A styled and configurable input or textarea
 *
 * @example
 * <Input
 *   label="Username"
 *   name="username"
 *   type="text"
 *   placeholder="Enter your username"
 *   required={true}
 * />
 *
 * @example
 * <Input
 *   label="Description"
 *   name="description"
 *   type="text"
 *   multiline={true}
 *   placeholder="Enter event description"
 * />
 */
const Input = ({
  label,
  name,
  type,
  filled,
  placeholder = '',
  required = false,
  onInput,
  onChange,
  onKeyDown,
  autoComplete,
  value,
  checked,
  defaultValue,
  multiline = false,
  accept,
  multiple = false,
  labelOnSameLine = false,
  min,
  max
}: InputProps) => {
  const location = useLocation();

  return (
    <label
      className={`flex ${
        type === 'checkbox' || labelOnSameLine
          ? 'flex-row items-center'
          : 'flex-col'
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
          className={`${generateStyleClasses(
            filled ?? true,
            false,
            location.pathname !== '/'
          ).replace(
            'w-full',
            type === 'checkbox' ? 'max-w-10' : 'w-full'
          )} p-2 rounded-lg flex-grow`}
          defaultValue={defaultValue}
          onInput={onInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={value}
        ></textarea>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          className={`${generateStyleClasses(
            filled ?? true,
            false,
            location.pathname !== '/'
          ).replace(
            'w-full',
            type === 'checkbox' ? 'max-w-10' : 'w-full'
          )} p-2 rounded-lg flex-grow ${!filled && 'text-black'}`}
          onInput={onInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
          value={value}
          checked={checked}
          defaultValue={defaultValue}
          accept={accept}
          multiple={multiple}
          min={min}
          max={max}
        />
      )}
    </label>
  );
};

export default Input;
