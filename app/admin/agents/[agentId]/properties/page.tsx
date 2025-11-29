import React from 'react';
import AgentProperties from '@/components/admin/AgentProperties';

export default function AgentPropertiesPage({
  params,
}: {
  params: { agentId: string };
}) {
  return <AgentProperties agentId={params.agentId} />;
}

