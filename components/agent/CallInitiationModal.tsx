'use client'

// Component: CallInitiationModal
// Purpose: Modal for initiating a single call with smart contact selection

import React, { useState, useEffect } from 'react';
import { X, Phone, Search, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface CallInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
}

export default function CallInitiationModal({ isOpen, onClose, onSuccess }: CallInitiationModalProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [manualPhone, setManualPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'contact' | 'manual'>('contact');
  const [error, setError] = useState('');

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ['contacts', searchTerm],
    queryFn: async () => {
      const { getMyContacts } = await import('@/lib/real_estate_agent/api');
      return getMyContacts(searchTerm);
    },
    enabled: isOpen && mode === 'contact'
  });

  const initiateCall = useMutation({
    mutationFn: async (data: { contact_id?: string; phone_number: string }) => {
      const { initiateCall: initiateCallAPI } = await import('@/lib/real_estate_agent/api');
      return initiateCallAPI(data);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to initiate call');
    }
  });

  const validatePhone = (phone: string) => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const handleSubmit = () => {
    setError('');
    if (mode === 'contact' && !selectedContact) {
      setError('Please select a contact');
      return;
    }
    if (mode === 'manual') {
      if (!manualPhone.trim()) {
        setError('Please enter a phone number');
        return;
      }
      if (!validatePhone(manualPhone)) {
        setError('Invalid phone number format. Use E.164 format (e.g., +15551234567)');
        return;
      }
    }

    const phoneNumber = mode === 'contact' ? selectedContact!.phone_number : manualPhone;
    const contactId = mode === 'contact' ? selectedContact!.id : undefined;
    initiateCall.mutate({ contact_id: contactId, phone_number: phoneNumber });
  };

  const resetForm = () => {
    setSelectedContact(null);
    setManualPhone('');
    setSearchTerm('');
    setMode('contact');
    setError('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600">
              <Phone className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Initiate Call</h2>
              <p className="text-gray-400 text-sm">Start a conversation with a contact</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-gray-800 rounded-xl mb-6">
          <button
            onClick={() => setMode('contact')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              mode === 'contact'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <User size={16} />
              Select Contact
            </span>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              mode === 'manual'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Phone size={16} />
              Enter Number
            </span>
          </button>
        </div>

        {mode === 'contact' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {contacts?.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedContact?.id === contact.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedContact?.id === contact.id
                          ? 'bg-green-500/20'
                          : 'bg-gray-700'
                      }`}>
                        <User className={
                          selectedContact?.id === contact.id
                            ? 'text-green-400'
                            : 'text-gray-400'
                        } size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{contact.name}</p>
                        <p className="text-gray-400 text-sm font-mono">{contact.phone_number}</p>
                      </div>
                    </div>
                    {selectedContact?.id === contact.id && (
                      <CheckCircle className="text-green-400" size={20} />
                    )}
                  </div>
                </button>
              ))}
              {contacts?.length === 0 && (
                <div className="text-center py-8">
                  <User className="mx-auto text-gray-600 mb-2" size={32} />
                  <p className="text-gray-400">No contacts found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number (E.164 format)
              </label>
              <input
                type="tel"
                placeholder="+15551234567"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              />
              <p className="mt-2 text-xs text-gray-500">
                Format: +[country code][number] (e.g., +15551234567)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {(selectedContact || (manualPhone && validatePhone(manualPhone))) && !error && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Phone className="text-green-400" size={16} />
              </div>
              <div>
                <p className="text-green-400 font-medium text-sm">Ready to call</p>
                <p className="text-gray-400 text-xs">
                  {mode === 'contact' ? selectedContact?.name : manualPhone}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={initiateCall.isPending}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={initiateCall.isPending || (!selectedContact && mode === 'contact') || (!manualPhone && mode === 'manual')}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center gap-2">
              {initiateCall.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Calling...
                </>
              ) : (
                <>
                  <Phone size={20} />
                  Initiate Call
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

