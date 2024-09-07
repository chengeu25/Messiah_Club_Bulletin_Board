interface InputProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

const Input = ({
  label,
  name,
  type,
  placeholder = '',
  required = false
}: InputProps) => (
  <label className='flex flex-row items-center gap-2'>
    <span>{label}</span>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className='border border-gray-300 p-2 rounded-lg flex-grow'
      required={required}
    />
  </label>
);
export default Input;
