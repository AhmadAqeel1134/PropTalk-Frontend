'use client'

// Component: VoiceAgentConfigurationSheet
// Purpose: Advanced configuration panel with live preview and validation

import React, { useState } from 'react';
import { 
  X, Save, Mic, Volume2, Sparkles, Settings, 
  User, MessageSquare, List, Eye, AlertCircle, Mic2, ChevronRight
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { invalidateVoiceAgentQueries } from '@/hooks/useAgent';
import VoiceStudioModal from './VoiceStudioModal';
import voices from '@/lib/voice/elevenlabsVoices';

interface VoiceAgentConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceAgentConfigurationSheet({ isOpen, onClose }: VoiceAgentConfigProps) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'basic' | 'voice' | 'advanced'>('basic');
  
  const { data: currentAgent } = useQuery({
    queryKey: ['voice-agent'],
    queryFn: async () => {
      const { getVoiceAgent } = await import('@/lib/real_estate_agent/api');
      return getVoiceAgent();
    },
    enabled: isOpen
  });

  const [config, setConfig] = useState({
    name: currentAgent?.name || 'Sales Assistant',
    use_default_prompt: currentAgent?.use_default_prompt ?? true,
    system_prompt: currentAgent?.system_prompt || '',
    settings: {
      voice_gender: (currentAgent?.settings?.voice_gender || 'female') as 'female' | 'male',
      voice_speed: (currentAgent?.settings?.voice_speed || 'normal') as 'normal' | 'slow' | 'fast',
      language: currentAgent?.settings?.language || 'en-US',
      greeting_message: currentAgent?.settings?.greeting_message || 'Hello! How can I help you today?',
      custom_commands: (currentAgent?.settings?.custom_commands || []) as string[],
      recording_enabled: currentAgent?.settings?.recording_enabled ?? true
    }
  });

  const [customCommand, setCustomCommand] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saveMutation = useMutation({
    mutationFn: async (data: typeof config) => {
      const { updateVoiceAgent } = await import('@/lib/real_estate_agent/api');
      return updateVoiceAgent(data);
    },
    onSuccess: () => {
      invalidateVoiceAgentQueries(queryClient);
      onClose();
    }
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!config.name.trim()) {
      newErrors.name = 'Agent name is required';
    }
    
    if (!config.use_default_prompt && !config.system_prompt.trim()) {
      newErrors.system_prompt = 'Custom prompt is required when not using default';
    }
    
    if (!config.settings.greeting_message.trim()) {
      newErrors.greeting_message = 'Greeting message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      saveMutation.mutate(config);
    }
  };

  const addCustomCommand = () => {
    if (customCommand.trim()) {
      setConfig({
        ...config,
        settings: {
          ...config.settings,
          custom_commands: [...config.settings.custom_commands, customCommand.trim()]
        }
      });
      setCustomCommand('');
    }
  };

  const removeCustomCommand = (index: number) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        custom_commands: config.settings.custom_commands.filter((_, i) => i !== index)
      }
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'voice', label: 'Voice Settings', icon: Mic },
    { id: 'advanced', label: 'Advanced', icon: Sparkles }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full md:w-[700px] z-50 animate-in slide-in-from-right duration-300">
        <div
          className={`border-l h-full flex flex-col ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}
        >
          <div
            className={`p-6 border-b backdrop-blur-sm ${
              theme === 'dark'
                ? 'border-gray-800 bg-gray-900/95'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Voice Agent Configuration
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Customize your AI assistant's behavior
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all hover:rotate-90 duration-300 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 border ${
                      activeTab === tab.id
                        ? theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                        : theme === 'dark'
                        ? 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-700 shadow-sm'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon size={18} />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'basic' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-500'
                          : theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
                      }`}
                      placeholder="e.g., Sales Assistant"
                    />
                    {errors.name && (
                      <p className={`mt-2 text-sm flex items-center gap-1 ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        <AlertCircle size={14} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-blue-500/5 border-blue-500/20'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100'
                        }`}
                      >
                        <Sparkles
                          className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          System Prompt
                        </h4>
                        <p className={`text-sm mb-3 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Choose between our optimized default prompt or create your own custom prompt.
                        </p>

                        <div className="space-y-3">
                          <label
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
                            }`}
                          >
                            <input
                              type="radio"
                              checked={config.use_default_prompt}
                              onChange={() => setConfig({ ...config, use_default_prompt: true })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div>
                              <p className={`font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                Use Default Prompt
                              </p>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Optimized for real estate sales
                              </p>
                            </div>
                          </label>
                          <label
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
                            }`}
                          >
                            <input
                              type="radio"
                              checked={!config.use_default_prompt}
                              onChange={() => setConfig({ ...config, use_default_prompt: false })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div>
                              <p className={`font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                Custom Prompt
                              </p>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Create your own instructions
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!config.use_default_prompt && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Custom System Prompt *
                      </label>
                      <textarea
                        value={config.system_prompt}
                        onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                        rows={8}
                        className={`w-full px-4 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.system_prompt
                            ? 'border-red-500'
                            : theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
                        }`}
                        placeholder="Enter your custom system prompt here..."
                      />
                      {errors.system_prompt && (
                        <p className={`mt-2 text-sm flex items-center gap-1 ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>
                          <AlertCircle size={14} />
                          {errors.system_prompt}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Greeting Message *
                    </label>
                    <input
                      type="text"
                      value={config.settings.greeting_message}
                      onChange={(e) => setConfig({
                        ...config,
                        settings: { ...config.settings, greeting_message: e.target.value }
                      })}
                      className={`w-full px-4 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.greeting_message
                          ? 'border-red-500'
                          : theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
                      }`}
                      placeholder="e.g., Hello! How can I help you today?"
                    />
                    {errors.greeting_message && (
                      <p className={`mt-2 text-sm flex items-center gap-1 ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        <AlertCircle size={14} />
                        {errors.greeting_message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'voice' && (
              <VoiceTabContent
                theme={theme}
                currentVoiceId={(currentAgent?.settings as any)?.elevenlabs_voice_id}
                currentSettings={currentAgent?.settings as any}
                config={config}
                setConfig={setConfig}
              />
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Call Recording
                      </span>
                      <button
                        onClick={() => setConfig({
                          ...config,
                          settings: {
                            ...config.settings,
                            recording_enabled: !config.settings.recording_enabled
                          }
                        })}
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                          config.settings.recording_enabled
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                          config.settings.recording_enabled ? 'translate-x-7' : ''
                        }`}></div>
                      </button>
                    </label>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Enable automatic recording of all calls for quality and training purposes
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Custom Commands
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customCommand}
                          onChange={(e) => setCustomCommand(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomCommand()}
                          placeholder="Enter a custom command..."
                          className={`flex-1 px-4 py-3 border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 ${
                            theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
                          }`}
                        />
                        <button
                          onClick={addCustomCommand}
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
                        >
                          Add
                        </button>
                      </div>
                      {config.settings.custom_commands.length > 0 && (
                        <div className="space-y-2">
                          {config.settings.custom_commands.map((cmd, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-3 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-800 border-gray-700'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <List
                                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                                size={16}
                              />
                              <span className={`flex-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {cmd}
                              </span>
                              <button
                                onClick={() => removeCustomCommand(i)}
                                className={`p-1 rounded transition-colors ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                                    : 'hover:bg-gray-200 text-gray-500 hover:text-red-600'
                                }`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div
            className={`p-6 border-t backdrop-blur-sm ${
              theme === 'dark'
                ? 'border-gray-800 bg-gray-900/95'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 px-6 py-3 rounded-xl border font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 shadow-sm'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  <Save size={20} />
                  {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


function VoiceTabContent({
  theme,
  currentVoiceId,
  currentSettings,
  config,
  setConfig,
}: {
  theme: string
  currentVoiceId?: string
  currentSettings?: any
  config: any
  setConfig: (fn: any) => void
}) {
  const isDark = theme === 'dark'
  const [studioOpen, setStudioOpen] = useState(false)

  const activeVoice = currentVoiceId
    ? voices.find((v) => v.id === currentVoiceId)
    : undefined
  const displayName =
    activeVoice?.name ||
    (currentVoiceId ? `Custom voice` : 'Default (server)')
  const displaySub =
    activeVoice != null
      ? `${activeVoice.gender === 'female' ? 'Female' : 'Male'} \u00b7 ${activeVoice.accent} \u00b7 ${activeVoice.tags[0]}`
      : currentVoiceId
        ? `ID …${currentVoiceId.slice(-8)}`
        : 'No saved voice in profile — ElevenLabs default from env is used'

  return (
    <>
      <div className="space-y-6">
        {/* Current voice summary card */}
        <div
          className={`p-5 rounded-xl border-2 transition-all ${
            isDark
              ? 'bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20'
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold ${
                activeVoice?.gender === 'female'
                  ? isDark
                    ? 'bg-pink-500/15 text-pink-400'
                    : 'bg-pink-100 text-pink-600'
                  : isDark
                  ? 'bg-sky-500/15 text-sky-400'
                  : 'bg-sky-100 text-sky-600'
              }`}
            >
              {(activeVoice?.name?.[0] || displayName[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {displayName}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {displaySub}
              </p>
            </div>
            <Mic2 className={isDark ? 'text-blue-400' : 'text-blue-600'} size={24} />
          </div>
        </div>

        {/* Open Voice Studio button */}
        <button
          onClick={() => setStudioOpen(true)}
          className={`w-full group flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
            isDark
              ? 'border-gray-700 hover:border-blue-500/40 hover:bg-blue-500/5'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Volume2
                className={`transition-colors ${
                  isDark
                    ? 'text-gray-400 group-hover:text-blue-400'
                    : 'text-gray-500 group-hover:text-blue-600'
                }`}
                size={20}
              />
            </div>
            <div className="text-left">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Open Voice Studio
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Browse, preview, and select from premium AI voices
              </p>
            </div>
          </div>
          <ChevronRight
            className={`transition-transform group-hover:translate-x-1 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`}
            size={20}
          />
        </button>

        {/* Language selector */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Language
          </label>
          <select
            value={config.settings.language}
            onChange={(e) =>
              setConfig((prev: any) => ({
                ...prev,
                settings: { ...prev.settings, language: e.target.value },
              }))
            }
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
            }`}
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
          </select>
        </div>
      </div>

      <VoiceStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        currentVoiceId={currentVoiceId}
        currentSettings={currentSettings}
      />
    </>
  )
}
