import React, { useState } from 'react';
import { ITCapabilityFramework } from '../components/ITCapabilityFramework';
import { ProcessPanel } from '../components/ProcessPanel';
import { supabase } from '../lib/supabase';

interface ProcessDetails {
  id: string;
  name: string;
  description: string[];
  key_questions: string[];
  key_artifacts: string[];
  maturity_levels: Record<string, string>;
}

export function Home() {
  const [selectedProcess, setSelectedProcess] = useState<ProcessDetails | null>(null);

  const handleProcessClick = async (processId: string) => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('id, name, description, key_questions, key_artifacts, maturity_levels')
        .eq('id', processId)
        .single();

      if (error) throw error;
      setSelectedProcess(data);
    } catch (err) {
      console.error('Error fetching process details:', err);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center space-y-4">
        <h1 className="font-bree text-4xl text-blue-dark">
          IT Process Maturity Assessment
        </h1>
        <p className="font-din text-gray text-lg max-w-2xl mx-auto">
          Evaluate and improve your organization's IT processes with our comprehensive assessment framework based on industry best practices
        </p>
      </header>

      <ITCapabilityFramework onProcessClick={handleProcessClick} />
      <ProcessPanel process={selectedProcess} onClose={() => setSelectedProcess(null)} />
    </div>
  );
}