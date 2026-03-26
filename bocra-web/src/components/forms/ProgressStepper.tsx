import React from 'react'
import { motion } from 'framer-motion'

interface Step {
  label: string
  description?: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', marginBottom: '2rem' }}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isActive = i === currentStep
        const isLast = i === steps.length - 1

        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: isLast ? 0 : 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {/* Step circle */}
                <motion.div
                  animate={{
                    backgroundColor: isCompleted ? '#2E7D32' : isActive ? 'var(--color-accent)' : 'var(--bg-elevated)',
                    borderColor: isCompleted ? '#2E7D32' : isActive ? 'var(--color-accent)' : 'var(--border-default)',
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '2px solid',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, zIndex: 1,
                  }}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: isActive ? '#fff' : 'var(--text-muted)',
                    }}>
                      {i + 1}
                    </span>
                  )}
                </motion.div>

                {/* Connector line */}
                {!isLast && (
                  <div style={{ flex: 1, height: 2, position: 'relative', marginLeft: '0.25rem' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--border-subtle)' }} />
                    <motion.div
                      animate={{ scaleX: isCompleted ? 1 : 0 }}
                      initial={{ scaleX: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: '#2E7D32',
                        transformOrigin: 'left',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Label below */}
              <div style={{ marginTop: '0.4rem', textAlign: 'center', paddingRight: isLast ? 0 : '0.5rem' }}>
                <p style={{
                  fontSize: '0.72rem', fontWeight: 600,
                  color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--color-internet)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                }}>
                  {step.label}
                </p>
                {step.description && isActive && (
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
