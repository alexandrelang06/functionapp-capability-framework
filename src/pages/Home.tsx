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
        <div className="font-din text-gray max-w-4xl mx-auto space-y-6">
          <p className="text-lg leading-relaxed">
            Explore the interactive framework below to navigate through key IT capabilities. This tool helps you assess the maturity of your organization's IT processes and log the results for future reuse and benchmarking.
            You can view the PowerPoint version at the following{' '}
            <a 
              href="https://be4you.sharepoint.com/:p:/r/sites/CIOAdvisory/Shared%20Documents/General/02.%20Community%20Assets/02.%20Operating%20Model%20Transformation/00.%20IT%20capability%20framework/BE_IT_Capability_Framework%20V06.25.pptx?d=w2913ccf9a3fb434d9626c82284e9c6a0&csf=1&web=1&e=ffhOR3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:text-blue-dark underline font-medium"
            >
              link
            </a>
          </p>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-blue-dark font-bold">•</span>
              <span>Use the "New Assessment" tab to start a new evaluation and create a company profile.</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-dark font-bold">•</span>
              <span>Use the "Assessments" tab to browse and search through past assessments.</span>
            </div>
            <div className="mt-4">
              <span>Please ensure accurate and consistent input – data quality is essential for meaningful insights.</span>
            </div>
          </div>
        </div>
      </header>

      <ITCapabilityFramework onProcessClick={handleProcessClick} />
      <ProcessPanel process={selectedProcess} onClose={() => setSelectedProcess(null)} />
    </div>
  );
}