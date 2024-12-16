import generateStyleClasses from './styleGenerator';
import { FormEventHandler } from 'react';

/**
 * Represents the properties for the Input component
 *
 * @interface InputProps
 * @property {string} label - The label text for the input
 * @property {string} name - The name attribute for the input
 * @property {string} type - The type of input (e.g., 'text', 'checkbox', 'file')
 * @property {string} [color='white'] - The color theme of the input
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
  multiple?: boolean;
  labelOnSameLine?: boolean;
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
 *   color="blue"
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
  accept,
  multiple = false,
  labelOnSameLine = false
}: InputProps) => (
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
        multiple={multiple}
      />
    )}
  </label>
);

export default Input;
