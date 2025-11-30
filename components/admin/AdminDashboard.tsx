'use client';

import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import StatsCard from '@/components/common/StatsCard';
import PageTransition from '@/components/common/PageTransition';
import VerificationRequestsSheet from './VerificationRequestsSheet';
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
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } = useAdminDashboard();
  const [isMounted, setIsMounted] = useState(false);
  const [isVerificationSheetOpen, setIsVerificationSheetOpen] = useState(false);

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
      <div className="min-h-screen p-6 md:p-8" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
        <div className="max-w-full">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">
                Platform Overview & Statistics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsVerificationSheetOpen(true)}
                className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white transition-all duration-200 flex items-center gap-2"
              >
                <ShieldCheck size={18} />
                <span className="hidden md:inline">View Verification Requests</span>
                <span className="md:hidden">Verification</span>
              </button>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          {dataUpdatedAt && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Real Estate Agents Stats */}
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Real Estate Agents</h2>
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

        {/* Overall Platform Stats */}
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Platform Statistics</h2>
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

        {/* Platform Health */}
        <div
          className={`bg-gray-900 border border-gray-800 rounded-lg p-6 transition-all duration-500 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '450ms' }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Platform Health</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-semibold text-white mb-1">
                {real_estate_agents.total_agents > 0
                  ? Math.round((real_estate_agents.active_agents / real_estate_agents.total_agents) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-400">Active Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-white mb-1">
                {real_estate_agents.total_agents > 0
                  ? Math.round((real_estate_agents.verified_agents / real_estate_agents.total_agents) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-gray-400">Verification Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-white mb-1">
                {real_estate_agents.total_agents > 0
                  ? Math.round(overall_stats.total_properties / real_estate_agents.total_agents)
                  : 0}
              </p>
              <p className="text-sm text-gray-400">Avg Properties/Agent</p>
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
    </PageTransition>
  );
};

export default AdminDashboard;

