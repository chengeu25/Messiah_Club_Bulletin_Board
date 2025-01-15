import generateStyleClasses from './styleGenerator';
import { useLocation } from 'react-router-dom';

/**
 * Represents the properties for the Button component
 *
 * @interface ButtonProps
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
 *   text="Click me"
 *   onClick={() => handleClick()}
 *   icon={<IconComponent />}
 *   filled={true}
 * />
 */
const Button = ({
  text,
  icon,
  onClick,
  type = 'button',
  name,
  filled = true,
  className,
  disabled = false,
  grow = true
}: ButtonProps) => {
  const location = useLocation();

  return (
    <button
      disabled={disabled}
      className={`${generateStyleClasses(
        filled,
        disabled,
        !(location.pathname === '/')
      )
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
};

export default Button;
