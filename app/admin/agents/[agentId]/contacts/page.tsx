import React from 'react';
import AgentContacts from '@/components/admin/AgentContacts';

export default function AgentContactsPage({
  params,
}: {
  params: { agentId: string };
}) {
  return <AgentContacts agentId={params.agentId} />;
}

