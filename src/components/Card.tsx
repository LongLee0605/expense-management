import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 w-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;


