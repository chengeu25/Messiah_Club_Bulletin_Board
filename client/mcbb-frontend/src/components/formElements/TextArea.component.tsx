import React from 'react';

interface TextAreaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  cols?: number;
  className?: string;
  disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  name,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  cols = 50,
  className = '',
  disabled = false,
}) => {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      cols={cols}
      className={`textarea ${className}`}
      disabled={disabled}
    />
  );
};

export default TextArea;
