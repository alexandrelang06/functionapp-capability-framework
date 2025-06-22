import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Process {
  id: string;
  name: string;
  category_id: string;
  description: string[];
  key_questions: string[];
  key_artifacts: string[];
  maturity_levels: Record<string, string>;
  short_description: string;
}

export function ProcessEditor() {
  const { processId } = useParams<{ processId: string }>();
  const navigate = useNavigate();
  
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch process data
  useEffect(() => {
    const fetchProcess = async () => {
      if (!processId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('processes')
          .select('*')
          .eq('id', processId)
          .single();
        
        if (error) throw error;
        
        // Ensure arrays are initialized
        const processData = {
          ...data,
          description: Array.isArray(data.description) ? data.description : [],
          key_questions: Array.isArray(data.key_questions) ? data.key_questions : [],
          key_artifacts: Array.isArray(data.key_artifacts) ? data.key_artifacts : [],
          maturity_levels: data.maturity_levels || {
            '1': 'Initial/Ad-hoc: Basic or no processes exist',
            '2': 'Repeatable: Processes follow a regular pattern',
            '3': 'Defined: Processes are documented and standardized',
            '4': 'Managed: Processes are measured and controlled',
            '5': 'Optimized: Focus on process improvement'
          }
        };
        
        setProcess(processData);
      } catch (err) {
        console.error('Error fetching process:', err);
        setError('Failed to load process data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcess();
  }, [processId]);

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      handleSave();
    }, 2000); // 2 seconds delay
    
    setAutoSaveTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const handleSave = async () => {
    if (!process) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const { error } = await supabase
        .from('processes')
        .update({
          short_description: process.short_description,
          description: process.description,
          key_questions: process.key_questions,
          key_artifacts: process.key_artifacts,
          maturity_levels: process.maturity_levels
        })
        .eq('id', process.id);
      
      if (error) throw error;
      
      setSuccess('Modifications enregistrées avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving process:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleShortDescriptionChange = (value: string) => {
    if (!process) return;
    setProcess({ ...process, short_description: value });
    triggerAutoSave();
  };

  const handleDescriptionChange = (index: number, value: string) => {
    if (!process) return;
    const newDescription = [...process.description];
    newDescription[index] = value;
    setProcess({ ...process, description: newDescription });
    triggerAutoSave();
  };

  const handleAddDescription = () => {
    if (!process) return;
    setProcess({ 
      ...process, 
      description: [...process.description, ''] 
    });
  };

  const handleRemoveDescription = (index: number) => {
    if (!process) return;
    const newDescription = [...process.description];
    newDescription.splice(index, 1);
    setProcess({ ...process, description: newDescription });
    triggerAutoSave();
  };

  const handleKeyQuestionChange = (index: number, value: string) => {
    if (!process) return;
    const newKeyQuestions = [...process.key_questions];
    newKeyQuestions[index] = value;
    setProcess({ ...process, key_questions: newKeyQuestions });
    triggerAutoSave();
  };

  const handleAddKeyQuestion = () => {
    if (!process) return;
    setProcess({ 
      ...process, 
      key_questions: [...process.key_questions, ''] 
    });
  };

  const handleRemoveKeyQuestion = (index: number) => {
    if (!process) return;
    const newKeyQuestions = [...process.key_questions];
    newKeyQuestions.splice(index, 1);
    setProcess({ ...process, key_questions: newKeyQuestions });
    triggerAutoSave();
  };

  const handleKeyArtifactChange = (index: number, value: string) => {
    if (!process) return;
    const newKeyArtifacts = [...process.key_artifacts];
    newKeyArtifacts[index] = value;
    setProcess({ ...process, key_artifacts: newKeyArtifacts });
    triggerAutoSave();
  };

  const handleAddKeyArtifact = () => {
    if (!process) return;
    setProcess({ 
      ...process, 
      key_artifacts: [...process.key_artifacts, ''] 
    });
  };

  const handleRemoveKeyArtifact = (index: number) => {
    if (!process) return;
    const newKeyArtifacts = [...process.key_artifacts];
    newKeyArtifacts.splice(index, 1);
    setProcess({ ...process, key_artifacts: newKeyArtifacts });
    triggerAutoSave();
  };

  const handleMaturityLevelChange = (level: string, value: string) => {
    if (!process) return;
    setProcess({
      ...process,
      maturity_levels: {
        ...process.maturity_levels,
        [level]: value
      }
    });
    triggerAutoSave();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue animate-spin" />
        <span className="ml-2 text-gray">Chargement des données du processus...</span>
      </div>
    );
  }

  if (error && !process) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/framework')}
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
        >
          Retour à la gestion du framework
        </button>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">Processus non trouvé</p>
        <button 
          onClick={() => navigate('/framework')}
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
        >
          Retour à la gestion du framework
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/framework')}
            className="mr-4 p-2 text-gray hover:text-blue transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bree text-2xl text-blue-dark">{process.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          {saving && (
            <div className="flex items-center text-blue">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Enregistrement...</span>
            </div>
          )}
          {success && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{success}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-bree text-xl text-blue-dark mb-4">Description courte</h2>
        <textarea
          value={process.short_description}
          onChange={(e) => handleShortDescriptionChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
          rows={2}
          placeholder="Brève description du processus..."
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bree text-xl text-blue-dark">Description détaillée</h2>
          <button
            onClick={handleAddDescription}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un paragraphe</span>
          </button>
        </div>
        
        {process.description.length === 0 ? (
          <p className="text-gray-500 italic">Aucune description détaillée. Cliquez sur "Ajouter un paragraphe" pour commencer.</p>
        ) : (
          <div className="space-y-4">
            {process.description.map((desc, index) => (
              <div key={index} className="flex items-start">
                <textarea
                  value={desc}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                  rows={3}
                  placeholder={`Paragraphe ${index + 1}...`}
                />
                <button
                  onClick={() => handleRemoveDescription(index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700 transition-colors"
                  title="Supprimer ce paragraphe"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bree text-xl text-blue-dark">Questions clés</h2>
          <button
            onClick={handleAddKeyQuestion}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une question</span>
          </button>
        </div>
        
        {process.key_questions.length === 0 ? (
          <p className="text-gray-500 italic">Aucune question clé. Cliquez sur "Ajouter une question" pour commencer.</p>
        ) : (
          <div className="space-y-4">
            {process.key_questions.map((question, index) => (
              <div key={index} className="flex items-start">
                <textarea
                  value={question}
                  onChange={(e) => handleKeyQuestionChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                  rows={2}
                  placeholder={`Question ${index + 1}...`}
                />
                <button
                  onClick={() => handleRemoveKeyQuestion(index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700 transition-colors"
                  title="Supprimer cette question"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bree text-xl text-blue-dark">Livrables clés</h2>
          <button
            onClick={handleAddKeyArtifact}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un livrable</span>
          </button>
        </div>
        
        {process.key_artifacts.length === 0 ? (
          <p className="text-gray-500 italic">Aucun livrable clé. Cliquez sur "Ajouter un livrable" pour commencer.</p>
        ) : (
          <div className="space-y-4">
            {process.key_artifacts.map((artifact, index) => (
              <div key={index} className="flex items-start">
                <textarea
                  value={artifact}
                  onChange={(e) => handleKeyArtifactChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                  rows={2}
                  placeholder={`Livrable ${index + 1}...`}
                />
                <button
                  onClick={() => handleRemoveKeyArtifact(index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700 transition-colors"
                  title="Supprimer ce livrable"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-bree text-xl text-blue-dark mb-4">Niveaux de maturité</h2>
        <div className="space-y-4">
          {['1', '2', '3', '4', '5'].map((level) => (
            <div key={level} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bree text-lg text-blue-dark mb-2">Niveau {level}</h3>
              <textarea
                value={process.maturity_levels[level] || ''}
                onChange={(e) => handleMaturityLevelChange(level, e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                rows={3}
                placeholder={`Description du niveau ${level}...`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}