import React from 'react'

export default function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div style={{ height: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '12px', width: '60%' }} />
          <div style={{ height: '12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ height: '12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px', width: '80%' }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      ))}
    </>
  )
}
