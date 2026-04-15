import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className = '', ...props }: InputProps) => {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && <label className="text-sm font-medium text-muted">{label}</label>}
      <div className={clsx(
        'flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition-all duration-300 focus-within:border-border-focus focus-within:bg-surface-hover',
        error ? 'border-error' : 'border-border'
      )}>
        {icon && <span className="text-muted flex-shrink-0">{icon}</span>}
        <input 
          className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted/50 text-sm" 
          {...props} 
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};
