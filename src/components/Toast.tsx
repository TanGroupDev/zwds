import { motion } from "framer-motion";

export default function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className={`w-full px-4 py-3 rounded-xl text-center text-white font-medium mb-4
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
    >
      {message}
    </motion.div>
  );
}
