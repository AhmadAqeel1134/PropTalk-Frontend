'use client';

import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import StatsCard from '@/components/common/StatsCard';
import PageTransition from '@/components/common/PageTransition';
import VerificationRequestsSheet from './VerificationRequestsSheet';
import VoiceAgentRequestsSheet from './VoiceAgentRequestsSheet';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Users,
  Building,
  FileText,
  Phone,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Radio,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } = useAdminDashboard();
  const [isMounted, setIsMounted] = useState(false);
  const [isVerificationSheetOpen, setIsVerificationSheetOpen] = useState(false);
  const [isVoiceAgentSheetOpen, setIsVoiceAgentSheetOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to load dashboard'}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  if (!data) {
    return <ErrorMessage message="No data available" fullScreen />;
  }

  const { real_estate_agents, overall_stats } = data;

  return (
    <PageTransition>
      <div
        className="min-h-screen p-6 md:p-8"
        style={
          theme === 'dark'
            ? { background: 'rgba(10, 15, 25, 0.95)' }
            : { background: 'rgba(248, 250, 252, 0.98)' }
        }
      >
        <div className="max-w-full">
        {/* Header Section with Enhanced Design */}
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div
            className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/80 border-gray-800/50'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 shadow-blue-50/50'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-2 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-gray-800/60 border-gray-700/50'
                        : 'bg-blue-50 border-blue-200 shadow-sm'
                    }`}
                  >
                    <TrendingUp size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
                  </div>
                  <div>
                    <h1 className={`text-3xl md:text-4xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Admin Dashboard
                    </h1>
                    <p className={`text-sm md:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Platform Overview & Statistics
                    </p>
                  </div>
                </div>
                {dataUpdatedAt && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-green-400/60' : 'bg-green-500'}`}></div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsVerificationSheetOpen(true)}
                  className={`px-5 py-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-gray-200/50'
                  }`}
                >
                  <ShieldCheck size={18} />
                  <span className="hidden md:inline">View Verification Requests</span>
                  <span className="md:hidden">Verification</span>
                </button>
                <button
                  onClick={() => setIsVoiceAgentSheetOpen(true)}
                  className={`px-5 py-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:border-gray-600 hover:text-white hover:bg-gray-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-gray-200/50'
                  }`}
                >
                  <Radio size={18} />
                  <span className="hidden md:inline">View Voice Agent Requests</span>
                  <span className="md:hidden">Voice Agents</span>
                </button>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className={`p-3 rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 shadow-gray-200/50'
                  }`}
                  title="Refresh data"
                >
                  <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real Estate Agents Stats Section */}
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <div
            className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl border ${
              theme === 'dark'
                ? 'bg-gray-900/60 border-gray-800/50'
                : 'bg-white border-gray-300 shadow-blue-50/30'
            }`}
          >
            <div
              className={`flex items-center gap-3 mb-6 pb-4 border-b ${
                theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200'
              }`}
            >
              <div
                className={`p-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <Users size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
              </div>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Real Estate Agents
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '0ms' }}
            >
              <StatsCard
                title="Total Agents"
                value={real_estate_agents.total_agents}
                icon={<Users size={20} />}
              />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '50ms' }}
            >
              <StatsCard
                title="Active"
                value={real_estate_agents.active_agents}
                icon={<CheckCircle size={20} />}
              />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <StatsCard
                title="Inactive"
                value={real_estate_agents.inactive_agents}
                icon={<XCircle size={20} />}
              />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '150ms' }}
            >
              <StatsCard
                title="Verified"
                value={real_estate_agents.verified_agents}
                icon={<UserCheck size={20} />}
              />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <StatsCard
                title="Unverified"
                value={real_estate_agents.unverified_agents}
                icon={<UserX size={20} />}
              />
            </div>
            </div>
          </div>
        </div>

        {/* Overall Platform Stats Section */}
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div
            className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl border ${
              theme === 'dark'
                ? 'bg-gray-900/60 border-gray-800/50'
                : 'bg-white border-gray-300 shadow-blue-50/30'
            }`}
          >
            <div
              className={`flex items-center gap-3 mb-6 pb-4 border-b ${
                theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200'
              }`}
            >
              <div
                className={`p-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <Building size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
              </div>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Platform Statistics
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '250ms' }}
            >
              <StatsCard
                title="Total Properties"
                value={overall_stats.total_properties}
                icon={<Building size={20} />}
                subtitle="Listed properties"
              />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <StatsCard
                title="Total Documents"
                value={overall_stats.total_documents}
                icon={<FileText size={20} />}
                subtitle="Uploaded files"
              />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '350ms' }}
            >
              <StatsCard
                title="Phone Numbers"
                value={overall_stats.total_phone_numbers}
                icon={<Phone size={20} />}
                subtitle="Twilio numbers"
              />
            </div>
            <div
              className={`transition-all duration-500 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <StatsCard
                title="Total Contacts"
                value={overall_stats.total_contacts}
                icon={<Users size={20} />}
                subtitle="End users"
              />
            </div>
            </div>
          </div>
        </div>

        {/* Platform Health Section */}
        <div
          className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl border transition-all duration-500 ease-out ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/80 border-gray-800/50'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 shadow-blue-50/50'
          } ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '450ms' }}
        >
          <div
            className={`flex items-center gap-3 mb-6 pb-4 border-b ${
              theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200'
            }`}
          >
            <div
              className={`p-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border-gray-700/50'
                  : 'bg-blue-50 border-blue-200 shadow-sm'
              }`}
            >
              <TrendingUp size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Platform Health
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`text-center p-6 rounded-xl border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/40 border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/60'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-4 mx-auto ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <CheckCircle size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
              </div>
              <p className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {real_estate_agents.total_agents > 0
                  ? Math.round((real_estate_agents.active_agents / real_estate_agents.total_agents) * 100)
                  : 0}%
              </p>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Rate
              </p>
            </div>
            <div
              className={`text-center p-6 rounded-xl border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/40 border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/60'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-4 mx-auto ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <UserCheck size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
              </div>
              <p className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {real_estate_agents.total_agents > 0
                  ? Math.round((real_estate_agents.verified_agents / real_estate_agents.total_agents) * 100)
                  : 0}%
              </p>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Verification Rate
              </p>
            </div>
            <div
              className={`text-center p-6 rounded-xl border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/40 border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/60'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-4 mx-auto ${
                  theme === 'dark'
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <Building size={24} className={theme === 'dark' ? 'text-gray-300' : 'text-blue-600'} />
              </div>
              <p className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {real_estate_agents.total_agents > 0
                  ? Math.round(overall_stats.total_properties / real_estate_agents.total_agents)
                  : 0}
              </p>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Properties/Agent
              </p>
            </div>
          </div>
        </div>

        </div>
      </div>
      
      {/* Verification Requests Sheet */}
      <VerificationRequestsSheet
        isOpen={isVerificationSheetOpen}
        onClose={() => setIsVerificationSheetOpen(false)}
      />

      {/* Voice Agent Requests Sheet */}
      <VoiceAgentRequestsSheet
        isOpen={isVoiceAgentSheetOpen}
        onClose={() => setIsVoiceAgentSheetOpen(false)}
      />
    </PageTransition>
  );
};

export default AdminDashboard;


