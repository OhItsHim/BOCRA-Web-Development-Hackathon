import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Toast as ToastType } from '../../hooks/useToast'

const typeStyles: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(46,125,50,0.95)', color: '#fff' },
  error: { bg: 'rgba(183,28,28,0.95)', color: '#fff' },
  warning: { bg: 'rgba(249,168,37,0.95)', color: '#000' },
  info: { bg: 'rgba(21,101,192,0.95)', color: '#fff' },
}

export default function ToastContainer({ toasts, onRemove }: { toasts: ToastType[]; onRemove: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AnimatePresence>
        {toasts.map(toast => {
          const style = typeStyles[toast.type] || typeStyles.info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: '12px 16px',
                borderRadius: '8px',
                maxWidth: '320px',
                fontSize: '0.875rem',
                fontWeight: 500,
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                cursor: 'pointer',
              }}
              onClick={() => onRemove(toast.id)}
              role="alert"
              aria-live="polite"
            >
              {toast.message}
              <span style={{ opacity: 0.7 }}>✕</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
