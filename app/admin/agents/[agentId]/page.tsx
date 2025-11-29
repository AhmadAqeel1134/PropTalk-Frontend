import React from 'react';
import AgentFullDetails from '@/components/admin/AgentFullDetails';

export default function AgentDetailsPage({
  params,
}: {
  params: { agentId: string };
}) {
  return <AgentFullDetails agentId={params.agentId} />;
}

