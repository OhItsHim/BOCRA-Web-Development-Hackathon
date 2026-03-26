import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

interface Message {
  id: string
  text: string
  from: 'user' | 'bot'
  timestamp: Date
}

const knowledgeBase: { pattern: RegExp; response: string }[] = [
  {
    pattern: /complaint|complain|report|dispute/i,
    response: `To submit a complaint:\n1. Go to our **Complaint Portal** at /consumer/complaint\n2. Choose anonymous or account submission\n3. Select sector and category\n4. Describe your issue (min 50 characters)\n5. Upload evidence (optional)\n6. Submit — you'll get a ticket number to track progress.`,
  },
  {
    pattern: /licen[sc]e|licen[sc]ing|apply|application/i,
    response: `BOCRA issues licences for:\n• **Telecoms** — Class, Individual, Network\n• **Broadcasting** — TV, Radio, Online\n• **Internet** — ISP, VSAT\n• **Postal** — Courier, Express\n\nVisit /licensing to apply online. Processing takes 60–90 business days.`,
  },
  {
    pattern: /track|status|ticket|reference/i,
    response: `You can track:\n• **Complaints** at /consumer/track — use your BOCRA-XXXX-XXXXXX ticket number\n• **Licence Applications** at /licensing/track — use your LIC-XXXX-XXXXX reference`,
  },
  {
    pattern: /hours|open|office|when/i,
    response: `BOCRA offices are open:\n**Monday – Friday: 08:00 – 17:00 CAT**\n\nOnline services (this portal) are available 24/7.`,
  },
  {
    pattern: /contact|phone|email|address|location/i,
    response: `Contact BOCRA:\n📞 **+267 395 8900**\n✉️ **info@bocra.org.bw**\n📍 Plot 50671, Fairgrounds, Gaborone\n\nOr visit our /contact page for a full directory.`,
  },
  {
    pattern: /consult|consultation|comment|submission/i,
    response: `BOCRA regularly opens public consultations on regulatory matters. Visit **/consultations** to:\n• View open consultations\n• Submit your comments\n• Download consultation documents`,
  },
  {
    pattern: /publicat|report|document|download/i,
    response: `BOCRA publications — annual reports, guidelines, tariff documents, and research — are available at **/publications**. All documents are free to download.`,
  },
  {
    pattern: /internet|isp|broadband|data/i,
    response: `For internet-related matters:\n• View licensed ISPs at /licensing/licensees\n• Report internet service issues at /consumer/complaint (select Internet sector)\n• See our Internet regulatory framework in Publications`,
  },
  {
    pattern: /telecoms|telecom|mobile|network|coverage|signal/i,
    response: `For telecommunications matters:\n• File coverage/quality complaints at /consumer/complaint\n• View licensed operators at /licensing/licensees\n• Check our consumer rights guide at /consumer/rights`,
  },
]

const defaultResponse = `Hello! I'm BOCRA's virtual assistant. I can help you with:\n\n• **Complaints** — filing and tracking\n• **Licensing** — applying and checking status\n• **Tracking** — complaint or application status\n• **Office hours** and **contact** details\n• **Consultations** and **publications**\n\nWhat can I help you with today?`

function getResponse(input: string): string {
  for (const { pattern, response } of knowledgeBase) {
    if (pattern.test(input)) return response
  }
  return defaultResponse
}

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => (
    <div key={i} style={{ marginBottom: line === '' ? '8px' : '2px' }}>
      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
    </div>
  ))
}

const BotAvatar = () => (
  <div style={{
    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
    backgroundColor: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
      {['#1565C0','#F9A825','#2E7D32','#B71C1C'].map((c, i) => (
        <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: c }} />
      ))}
    </div>
  </div>
)

const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: '4px', padding: '8px 12px' }}>
    {[0,1,2].map(i => (
      <motion.div
        key={i}
        style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}
        animate={{ y: [-3, 0, -3] }}
        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
      />
    ))}
  </div>
)

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: defaultResponse, from: 'bot', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), text: input.trim(), from: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    const userInput = input.trim()
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const response = getResponse(userInput)
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: response, from: 'bot', timestamp: new Date() }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, 800)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open BOCRA chat assistant'}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: '#1565C0', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(21,101,192,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="BOCRA Chat Assistant"
            aria-modal="true"
            style={{
              position: 'fixed', bottom: '90px', right: '24px', zIndex: 50,
              width: '350px', height: '500px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: 'var(--bg-elevated)',
            }}>
              <BotAvatar />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>BOCRA Assistant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2E7D32' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', gap: '8px', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.from === 'bot' && <BotAvatar />}
                  <div style={{
                    maxWidth: '240px', padding: '10px 12px', borderRadius: msg.from === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    backgroundColor: msg.from === 'user' ? '#1565C0' : 'var(--bg-elevated)',
                    color: msg.from === 'user' ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.8rem', lineHeight: 1.5,
                  }}>
                    {formatMessage(msg.text)}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <BotAvatar />
                  <div style={{ padding: '4px 8px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px' }}>
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                aria-label="Chat message input"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)',
                  fontSize: '0.8rem', outline: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                aria-label="Send message"
                style={{
                  padding: '8px 12px', borderRadius: '8px', border: 'none',
                  backgroundColor: input.trim() ? '#1565C0' : 'var(--bg-elevated)',
                  color: input.trim() ? '#fff' : 'var(--text-muted)',
                  cursor: input.trim() ? 'pointer' : 'default', fontSize: '0.875rem',
                }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
