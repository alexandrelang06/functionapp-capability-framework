import React from 'react';
import { X } from 'lucide-react';

interface ProcessDetails {
  id: string;
  name: string;
  description: string[];
  key_questions: string[];
  key_artifacts: string[];
  maturity_levels: Record<string, string>;
}

interface ProcessPanelProps {
  process: ProcessDetails | null;
  onClose: () => void;
}

export function ProcessPanel({ process, onClose }: ProcessPanelProps) {
  if (!process) return null;

  return (
    <div className="fixed top-0 bottom-0 right-0 w-[500px] bg-white shadow-lg border-l border-gray-200 overflow-y-auto h-screen">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-bree text-xl text-blue-dark">{process.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray hover:text-blue transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <h3 className="font-bree text-lg text-blue-dark mb-3">Description</h3>
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            {process.description.length > 0 ? (
              process.description.map((desc, index) => (
                <p key={index} className="text-gray-600">{desc}</p>
              ))
            ) : (
              <p className="text-gray-500 italic">En cours de définition</p>
            )}
          </div>
        </section>

        <section>
          <h3 className="font-bree text-lg text-blue-dark mb-3">Questions clés</h3>
          {process.key_questions.length > 0 ? (
            <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {process.key_questions.map((question, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue mt-1.5">•</span>
                  <span className="text-gray-600">{question}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">En cours de définition</p>
          )}
        </section>

        <section>
          <h3 className="font-bree text-lg text-blue-dark mb-3">Livrables clés</h3>
          {process.key_artifacts.length > 0 ? (
            <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {process.key_artifacts.map((artifact, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue mt-1.5">•</span>
                  <span className="text-gray-600">{artifact}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">En cours de définition</p>
          )}
        </section>

        <section>
          <h3 className="font-bree text-lg text-blue-dark mb-3">Niveaux de maturité</h3>
          <div className="space-y-4">
            {Object.entries(process.maturity_levels)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, description]) => (
                <div
                  key={level}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <h4 className="font-bree text-blue-dark mb-2">
                    Niveau {level}
                  </h4>
                  <p className="text-gray-600">{typeof description === 'string' ? description : description.description || 'En cours de définition'}</p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}