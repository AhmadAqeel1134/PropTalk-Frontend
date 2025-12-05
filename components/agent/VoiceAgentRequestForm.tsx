'use client'

// Component: VoiceAgentRequestForm
// Purpose: Simple form to request voice agent access

import React, { useState } from 'react';
import { Sparkles, Phone, Zap, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function VoiceAgentRequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const requestAgent = useMutation({
    mutationFn: async () => {
      const { requestVoiceAgent } = await import('@/lib/real_estate_agent/api');
      return requestVoiceAgent();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['voice-agent-status'] });
    }
  });

  if (isSubmitted) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 p-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse" />
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-4 border-green-500/30 mb-6 animate-in zoom-in duration-500">
            <CheckCircle className="text-green-400" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            Request Submitted!
          </h3>
          <p className="text-gray-400 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            Your voice agent request is being reviewed by our team. We'll notify you once it's approved.
          </p>
          <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <div className="text-2xl font-bold text-white mb-1">1-2</div>
              <div className="text-xs text-gray-400">Business Days</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs text-gray-400">AI Calling</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <div className="text-2xl font-bold text-white mb-1">∞</div>
              <div className="text-xs text-gray-400">Possibilities</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 hover:border-gray-700 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
          <Phone className="text-blue-400" size={80} />
        </div>
        <div className="absolute bottom-10 left-10 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="text-purple-400" size={60} />
        </div>
      </div>

      <div className="relative z-10 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="text-white" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">
              Get Your AI Voice Agent
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Unlock the power of AI-driven phone conversations. Let your voice agent handle calls, qualify leads, and engage with contacts 24/7.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800 transition-all duration-300 group/item"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`
                }}
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10 mb-2 group-hover/item:scale-110 transition-transform`}>
                  <Icon className="text-white" size={20} />
                </div>
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 mb-6">
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-blue-400">What happens next?</strong> Once you submit your request, our team will review it and set up your voice agent with a dedicated phone number. This typically takes 1-2 business days.
          </p>
        </div>

        <button
          onClick={() => requestAgent.mutate()}
          disabled={requestAgent.isPending}
          className="w-full group/btn relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {requestAgent.isPending ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Submitting Request...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Request Voice Agent
                <ArrowRight size={24} className="transition-transform group-hover/btn:translate-x-2" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </button>
        <p className="text-center text-gray-500 text-xs mt-4">
          By requesting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

