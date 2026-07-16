'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InquiryModal from './InquiryModal';

export default function InquiryTrigger({ targetName, targetType, buttonText }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center justify-center gap-sm px-xl py-sm bg-gradient-to-r from-accent to-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-label border border-transparent transition-all duration-300 hover:from-[#d04e1b] hover:to-[#c04315] active:from-[#b03f13] active:to-[#a03811] select-none rounded-lg shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" role="img" aria-label="Inquiry mail icon">
          <title>Inquiry</title>
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
        {buttonText || 'Inquire Now'}
      </motion.button>

      <InquiryModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        targetName={targetName} 
        targetType={targetType} 
      />
    </>
  );
}
