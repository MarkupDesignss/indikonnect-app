import { motion } from "framer-motion";

export default function ProductCardSkeleton(): JSX.Element {
    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative pt-[100%] bg-gray-200">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        backgroundSize: "200% 200%",
                    }}
                />
            </div>
            <div className="p-4 space-y-3">
                <motion.div
                    className="h-3 bg-gray-200 rounded w-1/3"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="h-4 bg-gray-200 rounded w-3/4"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.1,
                    }}
                />
                <motion.div
                    className="h-6 bg-gray-200 rounded w-1/2"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2,
                    }}
                />
                <motion.div
                    className="h-10 bg-gray-200 rounded w-full"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3,
                    }}
                />
            </div>
        </motion.div>
    );
}