import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal box */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                        className={`
                            relative w-full ${maxWidth}
                            bg-white shadow-2xl
                            rounded-t-2xl sm:rounded-2xl
                            max-h-[92dvh] sm:max-h-[90vh]
                            flex flex-col
                            overflow-hidden
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate pr-4">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 p-5">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
