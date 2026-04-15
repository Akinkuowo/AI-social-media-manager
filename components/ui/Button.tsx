import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-secondary hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)]',
  secondary: 'bg-surface border border-border text-white hover:bg-surface-hover',
  glass: 'glass text-white hover:bg-surface-hover hover:-translate-y-0.5',
  ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-surface',
  error: 'bg-error/10 text-error border border-error/20 hover:bg-error/20',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}: ButtonProps) => {
  return (
    <button 
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        isLoading && 'opacity-70 pointer-events-none',
        className
      )}
      disabled={isLoading || props.disabled} 
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};
