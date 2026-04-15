import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Card = ({ 
  children, 
  variant = 'glass', 
  padding = 'md', 
  className = '',
  onClick 
}: CardProps) => {
  const cardClasses = `
    ${styles.card} 
    ${styles[variant]} 
    ${styles[`p-${padding}`]} 
    ${onClick ? styles.clickable : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};
