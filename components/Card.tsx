
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, icon, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-indigo-600">{icon}</div>}
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>
      <div className="text-slate-600">
        {children}
      </div>
    </div>
  );
};

export default Card;
