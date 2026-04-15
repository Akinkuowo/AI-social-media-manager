import { useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = ({ label, error, icon, showPasswordToggle, className = '', type, ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && <label className="text-sm font-medium text-muted">{label}</label>}
      <div className={clsx(
        'flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition-all duration-300 focus-within:border-border-focus focus-within:bg-surface-hover',
        error ? 'border-error' : 'border-border'
      )}>
        {icon && <span className="text-muted flex-shrink-0">{icon}</span>}
        <input 
          type={inputType}
          className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted/50 text-sm" 
          {...props} 
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted hover:text-foreground transition-colors p-1 -mr-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};
