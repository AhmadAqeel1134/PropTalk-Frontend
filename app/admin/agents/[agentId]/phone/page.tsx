import React from 'react';
import AgentPhoneNumber from '@/components/admin/AgentPhoneNumber';

export default function AgentPhonePage({
  params,
}: {
  params: { agentId: string };
}) {
  return <AgentPhoneNumber agentId={params.agentId} />;
}

