import { InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <motion.div 
      className="flex flex-col gap-1 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {label && <label className="text-sm text-cyan-300 font-medium">{label}</label>}
      <input
        {...props}
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md
                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-cyan-400 transition-all"
      />
    </motion.div>
  );
};
