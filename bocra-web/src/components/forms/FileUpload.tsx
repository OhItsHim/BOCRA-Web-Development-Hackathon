import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSizeMB?: number
  multiple?: boolean
  label?: string
}

export default function FileUpload({
  onFilesChange,
  accept = 'application/pdf,image/jpeg,image/png',
  maxFiles = 5,
  maxSizeMB = 5,
  multiple = true,
  label = 'Upload Files',
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validateAndAdd = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArr = Array.from(newFiles)
      const errs: string[] = []
      const valid: File[] = []

      fileArr.forEach((f) => {
        if (f.size > maxSizeMB * 1024 * 1024) {
          errs.push(`${f.name} exceeds ${maxSizeMB}MB limit.`)
          return
        }
        const acceptedTypes = accept.split(',').map((t) => t.trim())
        const allowed = acceptedTypes.some((t) => {
          if (t.startsWith('.')) return f.name.toLowerCase().endsWith(t)
          return f.type === t || t === '*/*'
        })
        if (!allowed) {
          errs.push(`${f.name} is not an accepted file type.`)
          return
        }
        valid.push(f)
      })

      const combined = [...files, ...valid].slice(0, maxFiles)
      if (files.length + valid.length > maxFiles) {
        errs.push(`Maximum ${maxFiles} files allowed.`)
      }

      setErrors(errs)
      setFiles(combined)
      onFilesChange(combined)
    },
    [files, accept, maxFiles, maxSizeMB, onFilesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      validateAndAdd(e.dataTransfer.files)
    },
    [validateAndAdd]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAdd(e.target.files)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange(updated)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input-bocra')?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--border-default)'}`,
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragOver ? 'rgba(79,195,247,0.05)' : 'var(--bg-surface)',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          id="file-input-bocra"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.5 }}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>
          Drop files here or click to browse
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          PDF, JPG, PNG • Max {maxSizeMB}MB per file • Up to {maxFiles} files
        </p>
      </div>

      {errors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {errors.map((err, i) => (
            <p key={i} style={{ color: '#ef5350', fontSize: '0.8rem' }}>{err}</p>
          ))}
        </div>
      )}

      <AnimatePresence>
        {files.map((file, i) => (
          <motion.div
            key={file.name + i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 2v6h6" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeFile(i) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              aria-label={`Remove ${file.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
