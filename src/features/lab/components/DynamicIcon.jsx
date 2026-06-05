import React from 'react';
import { LabIconRegistry } from '../utils/iconRegistry';

const DynamicIcon = ({ iconName, iconColor, iconFill, className = "w-8 h-8" }) => {
  const IconComponent = LabIconRegistry[iconName] || LabIconRegistry.HelpCircle;
  
  return (
    <IconComponent 
      className={`${className} ${iconColor || 'text-slate-500'} drop-shadow-sm`} 
      fill={iconFill || "none"} 
      stroke={iconFill === 'currentColor' || iconFill === '#ffffff' ? '#cbd5e1' : 'currentColor'}
      strokeWidth={1.5} 
    />
  );
};

export default DynamicIcon;
