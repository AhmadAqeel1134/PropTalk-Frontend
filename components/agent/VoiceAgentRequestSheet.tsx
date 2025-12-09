'use client'

import { X, Sparkles, Phone, Zap, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/contexts/ThemeContext'

interface VoiceAgentRequestSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function VoiceAgentRequestSheet({ isOpen, onClose }: VoiceAgentRequestSheetProps) {
  const { theme } = useTheme()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const queryClient = useQueryClient()

  const requestAgent = useMutation({
    mutationFn: async () => {
      const { requestVoiceAgent } = await import('@/lib/real_estate_agent/api')
      return requestVoiceAgent()
    },
    onSuccess: () => {
      setIsSubmitted(true)
      queryClient.invalidateQueries({ queryKey: ['voice-agent-status'] })
      // Close after 3 seconds
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
      }, 3000)
    }
  })

  const handleClose = () => {
    setIsSubmitted(false)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={handleClose}
        />
      )}

      {/* Side Sheet */}
      <div
        className={`fixed top-0 right-0 h-full border-l z-50 transform transition-transform duration-300 ease-out ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        } ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: theme === 'dark' ? 'rgba(10, 15, 25, 0.97)' : 'rgba(255, 255, 255, 0.98)',
          width: 'calc(100vw - 320px)',
          minWidth: '500px',
          maxWidth: '800px',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`p-6 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <div>
              <p className={`text-xs uppercase tracking-wide mb-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Voice Agent
              </p>
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Request Voice Agent
              </h2>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 shadow-sm'
              }`}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isSubmitted ? (
              <div
                className={`rounded-2xl border p-8 overflow-hidden relative ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-800'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse ${
                    theme === 'light' ? 'opacity-20' : ''
                  }`}
                />

                <div className="relative z-10 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 mb-6 animate-in zoom-in duration-500 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
                        : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300'
                    }`}
                  >
                    <CheckCircle
                      className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}
                      size={48}
                    />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Request Submitted!
                  </h3>
                  <p className={`mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Your voice agent request is being reviewed by our team. We'll notify you once it's approved.
                  </p>
                  <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    {[
                      { value: '1-2', label: 'Business Days' },
                      { value: '24/7', label: 'AI Calling' },
                      { value: '∞', label: 'Possibilities' }
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`text-2xl font-bold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {stat.value}
                        </div>
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-800 hover:border-gray-700'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300 shadow-sm'
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 transition-opacity duration-500 ${
                    theme === 'dark'
                      ? 'opacity-0 group-hover:opacity-100'
                      : 'opacity-20 group-hover:opacity-30'
                  }`}
                />

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className={`absolute top-10 right-10 transition-opacity ${
                      theme === 'dark'
                        ? 'opacity-10 group-hover:opacity-20'
                        : 'opacity-5 group-hover:opacity-10'
                    }`}
                  >
                    <Phone
                      className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}
                      size={80}
                    />
                  </div>
                  <div
                    className={`absolute bottom-10 left-10 transition-opacity ${
                      theme === 'dark'
                        ? 'opacity-10 group-hover:opacity-20'
                        : 'opacity-5 group-hover:opacity-10'
                    }`}
                  >
                    <Sparkles
                      className={theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}
                      size={60}
                    />
                  </div>
                </div>

                <div className="relative z-10 p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="text-white" size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Get Your AI Voice Agent
                      </h3>
                      <p className={`leading-relaxed text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Unlock the power of AI-driven phone conversations. Let your voice agent handle calls, qualify leads, and engage with contacts 24/7.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {[
                      {
                        icon: Phone,
                        title: 'Automated Calling',
                        description: 'Make and receive calls automatically',
                        color: 'from-blue-500 to-cyan-500'
                      },
                      {
                        icon: Zap,
                        title: 'Instant Response',
                        description: 'Never miss a lead or opportunity',
                        color: 'from-purple-500 to-pink-500'
                      },
                      {
                        icon: Sparkles,
                        title: 'AI-Powered',
                        description: 'Natural conversations with prospects',
                        color: 'from-green-500 to-emerald-500'
                      },
                      {
                        icon: CheckCircle,
                        title: 'Lead Qualification',
                        description: 'Automatically qualify and route leads',
                        color: 'from-orange-500 to-red-500'
                      }
                    ].map((feature, i) => {
                      const Icon = feature.icon
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border transition-all duration-300 group/item ${
                            theme === 'dark'
                              ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm'
                          }`}
                        >
                          <div
                            className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10 mb-2 group-hover/item:scale-110 transition-transform`}
                          >
                            <Icon className="text-white" size={18} />
                          </div>
                          <h4 className={`font-semibold mb-1 text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {feature.title}
                          </h4>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {feature.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div
                    className={`p-4 rounded-xl border mb-6 ${
                      theme === 'dark'
                        ? 'bg-blue-500/5 border-blue-500/20'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <p className={`text-sm leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <strong className={theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}>
                        What happens next?
                      </strong>{' '}
                      Once you submit your request, our team will review it and set up your voice agent with a dedicated phone number. This typically takes 1-2 business days.
                    </p>
                  </div>

                  <button
                    onClick={() => requestAgent.mutate()}
                    disabled={requestAgent.isPending}
                    className="w-full group/btn relative overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {requestAgent.isPending ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Request Voice Agent
                          <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-2" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                  <p className="text-center text-gray-500 text-xs mt-4">
                    By requesting, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

