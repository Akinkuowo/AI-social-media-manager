import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export const Card = ({ 
  children, 
  variant = 'glass', 
  padding = 'md', 
  className = '',
  onClick 
}: CardProps) => {
  return (
    <div 
      className={clsx(
        'rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        variant === 'glass' && 'glass',
        variant === 'flat' && 'bg-surface-hover border border-border',
        paddingStyles[padding],
        onClick && 'cursor-pointer hover:border-border-focus hover:bg-surface-hover',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
