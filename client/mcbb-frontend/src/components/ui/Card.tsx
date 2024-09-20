interface CardProps {
  children: React.ReactNode;
  color: string;
  padding?: number;
  className?: string;
}

const Card = ({ children, color, padding = 2, className = '' }: CardProps) => (
  <div
    className={`rounded-lg bg-${color} w-full flex flex-col p-${padding} shadow-md overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export default Card;
