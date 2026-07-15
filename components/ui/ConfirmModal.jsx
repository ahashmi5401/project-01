import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' 
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      confirm: 'bg-red-500 hover:bg-red-600 text-white border-red-500/30',
      icon: 'text-red-400'
    },
    warning: {
      confirm: 'bg-accent hover:bg-[#d04e1b] text-white border-accent/30',
      icon: 'text-yellow-400'
    },
    info: {
      confirm: 'bg-accent hover:bg-[#d04e1b] text-white border-accent/30',
      icon: 'text-blue-400'
    }
  };

  const styles = variantStyles[variant] || variantStyles.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-navy border border-hairline shadow-elevation-lg rounded-lg max-w-md w-full"
            >
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/5 pointer-events-none rounded-tr-lg" />
              
              <div className="p-xl">
                {/* Icon */}
                <div className="flex justify-center mb-md">
                  <div className={`w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center ${styles.icon}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-sans font-bold text-h3 text-offwhite text-center mb-sm">
                  {title}
                </h3>

                {/* Message */}
                <p className="font-sans text-body text-steelblue text-center leading-relaxed mb-xl">
                  {message}
                </p>

                {/* Actions */}
                <div className="flex gap-md">
                  <button
                    onClick={onClose}
                    className="flex-1 px-lg py-sm border border-hairline hover:border-white/20 text-steelblue hover:text-offwhite font-mono uppercase tracking-wider text-label transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 px-lg py-sm border ${styles.confirm} font-mono uppercase tracking-wider text-label transition-colors rounded shadow-elevation-sm hover:shadow-elevation-md`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
