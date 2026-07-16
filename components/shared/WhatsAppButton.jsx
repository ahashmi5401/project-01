'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function WhatsAppButton({ phoneNumber, message = 'Hello, I would like to inquire about your services.', children }) {
  const adminPhone = phoneNumber || process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || '923463517689';
  // Real WhatsApp Business number: 0346-3517689 → international format 923463517689
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

  return (
    <motion.a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center justify-center gap-sm px-xl py-sm bg-gradient-to-r from-accent to-[#d04e1b] text-offwhite font-mono uppercase tracking-wider text-label border border-transparent transition-all duration-300 hover:from-[#d04e1b] hover:to-[#c04315] active:from-[#b03f13] active:to-[#a03811] select-none rounded-lg shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5"
    >
      {children || (
        <>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" role="img" aria-label="WhatsApp logo">
            <title>WhatsApp</title>
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.381 9.805-9.782.002-2.592-1.01-5.031-2.856-6.88-1.848-1.848-4.301-2.865-6.894-2.866-5.4.0-9.802 4.381-9.804 9.782-.001 2.014.524 3.986 1.522 5.719L1.9 22.1l4.747-1.946zm11.758-5.32c-.328-.164-1.944-.96-2.242-1.068-.298-.11-.515-.164-.73.164-.216.329-.838 1.068-1.026 1.287-.189.219-.378.247-.706.082-.328-.164-1.385-.51-2.637-1.63-1.002-.897-1.678-2.007-1.875-2.336-.197-.329-.021-.507.143-.67.147-.148.328-.384.492-.575.164-.191.219-.328.328-.547.11-.219.055-.411-.027-.575-.082-.164-.73-1.76-.999-2.409-.262-.636-.53-.55-.73-.56-.189-.01-.405-.012-.622-.012-.216 0-.568.082-.865.411-.297.329-1.137 1.113-1.137 2.715s1.163 3.148 1.325 3.366c.162.219 2.29 3.5 5.548 4.905.776.333 1.38.533 1.852.684.78.247 1.49.212 2.051.127.625-.094 1.944-.794 2.216-1.529.271-.735.271-1.365.189-1.499-.083-.134-.303-.217-.63-.381z" />
          </svg>
          Inquire via WhatsApp
        </>
      )}
    </motion.a>
  );
}
