import generateStyleClasses from './styleGenerator';

interface ButtonProps {
  color:
    | 'red'
    | 'blue'
    | 'green'
    | 'yellow'
    | 'purple'
    | 'orange'
    | 'gray'
    | 'white';
  text?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  filled?: boolean;
  type?: 'button' | 'submit' | 'reset' | undefined;
  name?: string;
  className?: string;
  disabled?: boolean;
}

const Button = ({
  color,
  text,
  icon,
  onClick,
  type = 'button',
  name,
  filled = true,
  className,
  disabled
}: ButtonProps) => (
  <button
    disabled={disabled}
    className={`${generateStyleClasses(color, filled)} ${className}`}
    onClick={onClick}
    type={type}
    name={name}
  >
    {text}
    {icon}
  </button>
);

export default Button;
