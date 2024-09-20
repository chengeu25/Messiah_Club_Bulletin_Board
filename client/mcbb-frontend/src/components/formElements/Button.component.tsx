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
}

const generateButtonClasses = (color: string, filled: boolean) => {
  const baseClasses = 'p-2 rounded-lg w-full transition duration-200';
  const filledClasses = `bg-${color}-950 text-white hover:bg-${color}-900 active:bg-${color}-800`;
  const outlinedClasses = `border-2 border-${color}-950 text-${color}-950 hover:text-${color}-900 hover:border-${color}-900 active:text-${color}-800 active:border-${color}-800`;

  return `${baseClasses} ${filled ? filledClasses : outlinedClasses}`;
};

const Button = ({
  color,
  text,
  onClick,
  type = 'button',
  name,
  filled = true
}: ButtonProps) => (
  <button
    className={generateButtonClasses(color, filled)}
    onClick={onClick}
    type={type}
    name={name}
  >
    {text}
  </button>
);

export default Button;
