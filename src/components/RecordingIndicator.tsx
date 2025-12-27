import { motion } from "framer-motion";

export const RecordingIndicator = () => {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-red-100">
      <span className="text-red-600 font-bold text-sm">جاري العمل</span>
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.6)]"
      />
    </div>
  );
};
