// src/components/features/AIAvatar.tsx
import { motion } from 'framer-motion';

interface AIAvatarProps {
  speaking?: boolean;
}

export default function AIAvatar({ speaking }: AIAvatarProps) {
  return (
    <motion.div 
      className="w-40 h-40 rounded-full overflow-hidden border-4 border-cyan-400/50 shadow-lg"
      animate={{ scale: speaking ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.6, repeat: speaking ? Infinity : 0 }}
    >
      <img
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fpng-clipart%2F20230102%2Foriginal%2Fpngtree-business-man-avatar-png-image_8855195.png&f=1&nofb=1&ipt=857af982c7b46ae1291359819cbbd2c016c9ef0a4a5bdcbbfc00a97997aa8275"
        alt="AI Assistant"
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
