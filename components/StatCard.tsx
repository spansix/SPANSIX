import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  colorClass: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, colorClass, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-[#212529] border border-[#343a40] rounded-lg p-3 text-center cursor-pointer flex flex-col justify-center h-full hover:bg-[#2b3035] transition-colors"
    >
      <div className={`text-3xl font-bold font-big ${colorClass}`}>
        {value}
      </div>
      <div className="text-xs uppercase text-gray-400 font-bold tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
};

export default StatCard;