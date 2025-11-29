import React from 'react';
import AgentDocuments from '@/components/admin/AgentDocuments';

export default function AgentDocumentsPage({
  params,
}: {
  params: { agentId: string };
}) {
  return <AgentDocuments agentId={params.agentId} />;
}

