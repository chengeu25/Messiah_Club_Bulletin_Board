import generateStyleClasses from './styleGenerator.function';

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
  text: string;
  onClick?: () => void;
  filled?: boolean;
  type?: 'button' | 'submit' | 'reset' | undefined;
  name?: string;
  className?: string;
}

const Button = ({
  color,
  text,
  onClick,
  type = 'button',
  name,
  filled = true,
  className
}: ButtonProps) => (
  <button
    className={`${generateStyleClasses(color, filled)} ${className}`}
    onClick={onClick}
    type={type}
    name={name}
  >
    {text}
  </button>
);

export default Button;
