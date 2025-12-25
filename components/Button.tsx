import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-4 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl"
  };

  const variants = {
    primary: "bg-ivy-navy text-white hover:bg-[#0a1020] shadow-md shadow-ivy-navy/20 border border-transparent",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    danger: "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    glass: "bg-white/80 backdrop-blur-md border border-white/40 text-slate-800 hover:bg-white shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};