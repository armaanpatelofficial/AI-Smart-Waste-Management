import { useState, useRef, useEffect } from 'react'
import PublicNavbar from '../../components/PublicNavbar.jsx'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! I am your Swachh AI Assistant. How can I help you keep our city clean today?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: input, history: messages.slice(-5) })
      })

      const data = await res.json()

      const botMsg = {
        id: Date.now() + 1,
        text: data.text || "I'm having trouble thinking. Please try again later.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error("Chat error:", err)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "System Offline: Could not reach the AI brain. Please check your connection.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      <PublicNavbar />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl relative">
              🤖
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full pulse-ring"></span>
            </div>
            <div>
              <h2 className="font-baloo font-bold text-xl text-gray-800">Swachh AI Assistant</h2>
              <p className="text-xs font-dm text-green-600 font-medium uppercase tracking-wider">Online & Ready to Help</p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-dm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              🇮🇳 Swachh Bharat Mission AI
            </span>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden relative">
          
          {/* Messages area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
                <div className={`max-w-[80%] flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    px-5 py-3.5 rounded-2xl font-dm text-sm leading-relaxed whitespace-pre-wrap
                    ${m.sender === 'user' 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-none shadow-md shadow-green-100' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-50'}
                  `}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 font-dm ml-1 mr-1 uppercase tracking-tighter">
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start fade-in">
                <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Guidelines / Tips */}
          {!loading && messages.length < 3 && (
            <div className="px-6 py-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {["How to segregate waste?", "Explain Green Bin", "Who is the PM?", "What are Swachh Points?"].map(t => (
                <button key={t} onClick={() => { setInput(t) }}
                  className="text-xs bg-green-50 text-green-700 font-medium px-3 py-1.5 rounded-full border border-green-100 hover:bg-green-100 transition-all">
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about waste..."
                className="w-full pl-6 pr-14 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-dm text-sm shadow-inner transition-all bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 p-2.5 rounded-xl bg-green-500 text-white shadow-md shadow-green-200 hover:bg-green-600 transition-all disabled:grayscale disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-center mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-dm">
           Your data is handled securely by AI-Smart-Vahan Systems
        </p>
      </div>
    </div>
  )
}
