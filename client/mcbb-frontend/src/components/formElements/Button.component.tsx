import generateStyleClasses from './styleGenerator';

/**
 * Represents the properties for the Button component
 * 
 * @interface ButtonProps
 * @property {string} color - The color theme of the button
 * @property {string} [text] - Optional text to display on the button
 * @property {JSX.Element} [icon] - Optional icon to display on the button
 * @property {() => void} [onClick] - Optional click event handler
 * @property {boolean} [filled=true] - Determines if the button is filled or outlined
 * @property {'button' | 'submit' | 'reset' | undefined} [type='button'] - The type of button
 * @property {string} [name] - Optional name attribute for the button
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {boolean} [disabled] - Disables the button if true
 * @property {boolean} [grow=true] - Determines if the button should grow to fill available space
 */
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
  grow?: boolean;
}

/**
 * A flexible and customizable button component with various styling options
 * 
 * @component
 * @param {ButtonProps} props - The properties for the Button component
 * @returns {JSX.Element} A styled and configurable button
 * 
 * @example
 * <Button 
 *   color="blue" 
 *   text="Click me" 
 *   onClick={() => handleClick()}
 *   icon={<IconComponent />}
 *   filled={true}
 * />
 */
const Button = ({
  color,
  text,
  icon,
  onClick,
  type = 'button',
  name,
  filled = true,
  className,
  disabled,
  grow = true
}: ButtonProps) => (
  <button
    disabled={disabled}
    className={`${generateStyleClasses(color, filled, disabled)
      .replace(!grow ? 'w-full' : '', '')
      .replace(!grow ? 'flex-grow' : '', '')} ${className}`}
    onClick={onClick}
    type={type}
    name={name}
  >
    {text}
    {icon}
  </button>
);

export default Button;
