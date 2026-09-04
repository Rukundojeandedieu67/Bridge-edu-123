import { useEffect, useRef, useState } from 'react'
import { useSupportSettings } from '../hooks/useSupportSettings.js'

const faqItems = [
  {
    question: 'How do I apply for an opportunity?',
    keywords: ['apply', 'application', 'opportunity'],
    answer: 'Open an opportunity and select Apply now. You need to create an account or sign in before submitting an application.',
  },
  {
    question: 'Can I browse without an account?',
    keywords: ['browse', 'account', 'signup', 'sign up', 'without'],
    answer: 'Yes. You can browse and filter all opportunities without signing up. An account is required for applications, pathways, and mentorship.',
  },
  {
    question: 'How does mentorship work?',
    keywords: ['mentor', 'mentorship', 'mentee'],
    answer: 'Students submit a mentorship request with a topic. A verified mentor or administrator can then match the request and start the conversation.',
  },
  {
    question: 'How can I become a mentor?',
    keywords: ['become', 'mentor', 'verified'],
    answer: 'Create an account as a mentor, complete your profile, and wait for the BridgeEdu team to verify your mentor status.',
  },
]

function SupportWidget() {
  const { settings } = useSupportSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const inputRef = useRef(null)
  const whatsappNumber = String(settings.whatsapp_number ?? '').replace(/[^0-9]/g, '')
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    inputRef.current?.focus()
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const askQuestion = (item) => {
    setMessages((current) => [
      ...current,
      { type: 'user', text: item.question },
      { type: 'bot', text: item.answer },
    ])
  }

  const answerQuestion = (text) => {
    const normalizedQuestion = text.trim().toLowerCase()

    if (!normalizedQuestion) {
      return
    }

    const matchedFaq = faqItems.find((item) => {
      return item.keywords.some((keyword) => normalizedQuestion.includes(keyword))
    })

    setMessages((current) => [
      ...current,
      { type: 'user', text: text.trim() },
      {
        type: 'bot',
        text: matchedFaq
          ? matchedFaq.answer
          : 'I do not have an answer for that yet. Please contact BridgeEdu support directly and our team will help you.',
      },
    ])
    setQuestion('')
  }

  const handleQuestionSubmit = (event) => {
    event.preventDefault()
    answerQuestion(question)
  }

  return (
    <aside className="fixed inset-0 z-50 pointer-events-none">
      {isOpen ? (
        <>
          <button type="button" aria-label="Close help chat" onClick={() => setIsOpen(false)} className="pointer-events-auto absolute inset-0 h-full w-full cursor-default bg-slate-950/30 backdrop-blur-[2px]" />
          <section role="dialog" aria-modal="true" aria-labelledby="support-chat-title" className="pointer-events-auto absolute bottom-0 right-0 flex max-h-[min(680px,calc(100vh-2rem))] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:bottom-6 sm:right-6 sm:w-[min(420px,calc(100vw-3rem))] sm:rounded-2xl">
          <header className="flex items-center justify-between bg-slate-950 px-4 py-4 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">BridgeEdu support</p>
              <h2 id="support-chat-title" className="mt-1 text-base font-semibold">How can we help?</h2>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close help chat" className="rounded-lg px-2 py-1 text-xl leading-none text-slate-300 hover:bg-white/10 hover:text-white">x</button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm leading-6 text-slate-700 shadow-sm">
              {settings.support_message || 'Choose a question or type your question below and I will help you find the answer.'}
            </div>
            {messages.map((message, index) => (
              <div key={`${message.type}-${index}`} className={`max-w-[90%] rounded-2xl p-3 text-sm leading-6 ${message.type === 'user' ? 'ml-auto rounded-tr-sm bg-cyan-600 text-white' : 'rounded-tl-sm bg-white text-slate-700 shadow-sm'}`}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Frequently asked</p>
            <div className="space-y-2">
              {faqItems.map((item) => (
                <button key={item.question} type="button" onClick={() => askQuestion(item)} className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-slate-950">
                  {item.question}
                </button>
              ))}
            </div>
            <form onSubmit={handleQuestionSubmit} className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <label htmlFor="support-question" className="sr-only">Type your question</label>
              <input
                id="support-question"
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Type your question..."
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
              <button type="submit" disabled={!question.trim()} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                Send
              </button>
            </form>
            <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
              {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1fb958]"><span aria-hidden="true">◉</span> WhatsApp</a> : null}
              {settings.support_email ? <a href={`mailto:${settings.support_email}`} className="text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-950">Email support</a> : null}
            </div>
          </div>
          </section>
        </>
      ) : (
        <button type="button" onClick={() => setIsOpen(true)} aria-label="Open BridgeEdu help chatbot" className="pointer-events-auto absolute bottom-5 right-5 flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/20 transition hover:bg-slate-800 sm:bottom-6 sm:right-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-slate-950" aria-hidden="true">?</span>
          Need help?
        </button>
      )}
    </aside>
  )
}

export default SupportWidget
