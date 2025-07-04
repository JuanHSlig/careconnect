import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

const variantStyles = {
  primary: 'bg-vibePurple hover:bg-vibePink text-white',
  secondary: 'bg-vibeBlue hover:bg-vibePurple text-white dark:bg-[#232b3a] dark:hover:bg-vibePurple dark:text-white',
  danger: 'bg-red-500 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 dark:text-white',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}) => (
  <button
    className={clsx(
      'px-5 py-2 rounded-lg font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vibePink/60 flex items-center justify-center gap-2',
      variantStyles[variant],
      loading && 'opacity-60 cursor-wait',
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
    )}
    {children}
  </button>
); 