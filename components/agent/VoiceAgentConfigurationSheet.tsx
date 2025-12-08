'use client'

// Component: VoiceAgentConfigurationSheet
// Purpose: Advanced configuration panel with live preview and validation

import React, { useState } from 'react';
import { 
  X, Save, Mic, Volume2, Sparkles, Settings, 
  User, MessageSquare, List, Eye, AlertCircle 
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface VoiceAgentConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceAgentConfigurationSheet({ isOpen, onClose }: VoiceAgentConfigProps) {
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
      queryClient.invalidateQueries({ queryKey: ['voice-agent'] });
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
        <div className="bg-gray-900 border-l border-gray-800 h-full flex flex-col">
          <div className="p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Voice Agent Configuration</h2>
                <p className="text-gray-400 text-sm">Customize your AI assistant's behavior</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300"
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
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white'
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className={`w-full px-4 py-3 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      placeholder="e.g., Sales Assistant"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Sparkles className="text-blue-400" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">System Prompt</h4>
                        <p className="text-gray-400 text-sm mb-3">
                          Choose between our optimized default prompt or create your own custom prompt.
                        </p>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 cursor-pointer hover:bg-gray-800 transition-all">
                            <input
                              type="radio"
                              checked={config.use_default_prompt}
                              onChange={() => setConfig({ ...config, use_default_prompt: true })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div>
                              <p className="text-white font-medium">Use Default Prompt</p>
                              <p className="text-gray-400 text-sm">Optimized for real estate sales</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 cursor-pointer hover:bg-gray-800 transition-all">
                            <input
                              type="radio"
                              checked={!config.use_default_prompt}
                              onChange={() => setConfig({ ...config, use_default_prompt: false })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div>
                              <p className="text-white font-medium">Custom Prompt</p>
                              <p className="text-gray-400 text-sm">Create your own instructions</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!config.use_default_prompt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Custom System Prompt *
                      </label>
                      <textarea
                        value={config.system_prompt}
                        onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                        rows={8}
                        className={`w-full px-4 py-3 bg-gray-800 border ${errors.system_prompt ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none`}
                        placeholder="Enter your custom system prompt here..."
                      />
                      {errors.system_prompt && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.system_prompt}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Greeting Message *
                    </label>
                    <input
                      type="text"
                      value={config.settings.greeting_message}
                      onChange={(e) => setConfig({
                        ...config,
                        settings: { ...config.settings, greeting_message: e.target.value }
                      })}
                      className={`w-full px-4 py-3 bg-gray-800 border ${errors.greeting_message ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      placeholder="e.g., Hello! How can I help you today?"
                    />
                    {errors.greeting_message && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.greeting_message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'voice' && (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Voice Gender
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['female', 'male'] as const).map(gender => (
                        <button
                          key={gender}
                          onClick={() => setConfig({
                            ...config,
                            settings: { ...config.settings, voice_gender: gender }
                          })}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            config.settings.voice_gender === gender
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              config.settings.voice_gender === gender
                                ? 'bg-purple-500/20'
                                : 'bg-gray-700'
                            }`}>
                              <User className={
                                config.settings.voice_gender === gender
                                  ? 'text-purple-400'
                                  : 'text-gray-400'
                              } size={20} />
                            </div>
                            <span className={`font-medium capitalize ${
                              config.settings.voice_gender === gender
                                ? 'text-purple-400'
                                : 'text-gray-300'
                            }`}>
                              {gender}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Voice Speed
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['slow', 'normal', 'fast'] as const).map(speed => (
                        <button
                          key={speed}
                          onClick={() => setConfig({
                            ...config,
                            settings: { ...config.settings, voice_speed: speed }
                          })}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            config.settings.voice_speed === speed
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <span className={`font-medium capitalize ${
                            config.settings.voice_speed === speed
                              ? 'text-blue-400'
                              : 'text-gray-300'
                          }`}>
                            {speed}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={config.settings.language}
                      onChange={(e) => setConfig({
                        ...config,
                        settings: { ...config.settings, language: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">Call Recording</span>
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
                            : 'bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                          config.settings.recording_enabled ? 'translate-x-7' : ''
                        }`}></div>
                      </button>
                    </label>
                    <p className="text-sm text-gray-400">
                      Enable automatic recording of all calls for quality and training purposes
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
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
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                            <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-gray-800 border border-gray-700">
                              <List className="text-gray-400" size={16} />
                              <span className="flex-1 text-gray-300">{cmd}</span>
                              <button
                                onClick={() => removeCustomCommand(i)}
                                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
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

          <div className="p-6 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium transition-all"
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

