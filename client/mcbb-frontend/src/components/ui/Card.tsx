/**
 * Defines the properties for the Card component
 * 
 * @interface CardProps
 * @property {React.ReactNode} children - The content to be rendered inside the card
 * @property {string} color - The background color of the card (Tailwind CSS color class)
 * @property {number} [padding=2] - Optional padding size (Tailwind CSS padding class)
 * @property {string} [className=''] - Optional additional CSS classes
 */
interface CardProps {
  children: React.ReactNode;
  color: string;
  padding?: number;
  className?: string;
}

/**
 * Renders a flexible and customizable card component
 * 
 * @component
 * @param {CardProps} props - The properties for the Card
 * @returns {JSX.Element} A styled card container with customizable color and padding
 * 
 * @example
 * <Card color="blue-950" padding={4} className="hover:shadow-lg">
 *   <p>Card content goes here</p>
 * </Card>
 * 
 * @remarks
 * - Uses Tailwind CSS for dynamic styling
 * - Supports custom background colors
 * - Configurable padding
 * - Includes a subtle shadow for depth
 * - Flexible content rendering
 */
const Card = ({ children, color, padding = 2, className = '' }: CardProps) => (
  <div
    className={`rounded-lg bg-${color} w-full flex p-${padding} shadow-md ${className}`}
  >
    {children}
  </div>
);

export default Card;
