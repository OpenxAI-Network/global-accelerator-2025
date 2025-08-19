import { SelectHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <motion.div className="flex flex-col gap-1 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {label && <label className="text-sm text-cyan-300">{label}</label>}
      <select
        {...props}
        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white
                   focus:ring-2 focus:ring-cyan-400 focus:outline-none backdrop-blur-md"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black/90">
            {option.label}
          </option>
        ))}
      </select>
    </motion.div>
  );
};
