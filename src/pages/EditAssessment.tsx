import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';
import { useFramework } from '../contexts/FrameworkContext';

interface ProcessScore {
  id: string;
  name: string;
  score: number;
  notes?: string;
}

interface EditableProcessScore extends ProcessScore {
  originalScore: number;
  edited: boolean;
}

export function EditAssessment() {
  const { assessmentId, categoryId } = useParams<{ assessmentId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { frameworkData } = useFramework();
  
  const [categoryTitle, setCategoryTitle] = useState('');
  const [domainTitle, setDomainTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [processes, setProcesses] = useState<EditableProcessScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScoreHelp, setShowScoreHelp] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For now, we'll use mock data similar to what we have in AssessmentView
    const fetchData = async () => {
      setLoading(true);
      
      // This would be an API call in a real application
      const mockAssessmentData = {
        '1': {
          companyName: 'TechCorp Solutions',
          scores: [
            { processId: 'it-strategy', score: 4, notes: 'Well-defined IT strategy aligned with business goals.' },
            { processId: 'portfolio-management', score: 3.5, notes: 'Portfolio management practices are in place but not fully mature.' },
            { processId: 'enterprise-architecture', score: 4.2, notes: 'Strong enterprise architecture practices.' },
            { processId: 'risk-compliance', score: 3.8, notes: 'Good risk management, some compliance gaps.' },
            { processId: 'it-security', score: 4.5, notes: 'Excellent security controls and practices.' },
            { processId: 'business-relationship', score: 3.7, notes: 'Effective business relationships but room for improvement.' },
            { processId: 'demand-management', score: 3.9, notes: 'Demand management processes are well established.' },
            { processId: 'programs-projects', score: 4.1, notes: 'Strong project management methodology.' },
            { processId: 'solution-delivery', score: 4.3, notes: 'Effective solution delivery practices.' },
            { processId: 'operations', score: 3.6, notes: 'Operations are stable but some automation needed.' },
            { processId: 'support-improve', score: 3.9, notes: 'Good support processes with continuous improvement focus.' },
            { processId: 'finance-controlling', score: 4.0, notes: 'Strong financial controls and transparency.' },
            { processId: 'organization-hr', score: 3.7, notes: 'Effective organizational structure, some skills gaps.' },
            { processId: 'asset-management', score: 3.5, notes: 'Asset management processes need more maturity.' },
            { processId: 'sourcing-procurement', score: 3.8, notes: 'Well-managed vendor relationships with some process gaps.' }
          ],
        },
        '2': {
          companyName: 'Global Banking Ltd',
          scores: [
            { processId: 'it-strategy', score: 3.5, notes: 'IT strategy exists but needs better alignment with business.' },
            { processId: 'portfolio-management', score: 3.2, notes: 'Basic portfolio management in place.' },
            { processId: 'enterprise-architecture', score: 3.0, notes: 'Architecture practices need improvement.' },
            { processId: 'risk-compliance', score: 4.5, notes: 'Very strong risk and compliance focus.' },
            { processId: 'it-security', score: 4.8, notes: 'Exceptional security controls as expected in banking.' },
            { processId: 'business-relationship', score: 3.2, notes: 'Some silos exist between IT and business.' },
            { processId: 'demand-management', score: 3.0, notes: 'Demand process exists but is not well-structured.' },
            { processId: 'programs-projects', score: 3.5, notes: 'Project delivery is generally effective but inconsistent.' },
            { processId: 'solution-delivery', score: 3.4, notes: 'Solutions are delivered but often with quality issues.' }
          ],
        }
      };

      if (!assessmentId || !categoryId) {
        navigate('/assessments');
        return;
      }

      // Find assessment data
      const assessment = mockAssessmentData[assessmentId as keyof typeof mockAssessmentData];
      if (!assessment) {
        navigate('/assessments');
        return;
      }

      setCompanyName(assessment.companyName);

      // Find category and domain information
      let foundCategory = null;
      let foundDomain = null;

      for (const domain of frameworkData) {
        for (const category of domain.categories) {
          if (category.id === categoryId) {
            foundCategory = category;
            foundDomain = domain;
            break;
          }
        }
        if (foundCategory) break;
      }

      if (!foundCategory || !foundDomain) {
        navigate(`/assessments/${assessmentId}`);
        return;
      }

      setCategoryTitle(foundCategory.title);
      setDomainTitle(foundDomain.title);

      // Prepare process scores for this category
      const processScores = foundCategory.processes.map(process => {
        // Find the score for this process in the assessment data
        const scoreData = assessment.scores.find(s => s.processId === process.id);
        
        return {
          id: process.id,
          name: process.name,
          score: scoreData?.score || 0,
          originalScore: scoreData?.score || 0,
          notes: scoreData?.notes || '',
          edited: false
        };
      });

      setProcesses(processScores);
      setLoading(false);
    };

    fetchData();
  }, [assessmentId, categoryId, frameworkData, navigate]);

  const handleScoreChange = (id: string, value: number) => {
    // Ensure score is a whole number between 1 and 5
    const score = Math.round(Math.min(Math.max(1, value), 5));
    
    setProcesses(prev => prev.map(process => 
      process.id === id 
        ? { 
            ...process, 
            score,
            edited: process.originalScore !== score
          } 
        : process
    ));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setProcesses(prev => prev.map(process => 
      process.id === id ? { ...process, notes } : process
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // In a real application, you would save this data to your API
    // For now, we'll just simulate a save operation
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // After saving, update the original scores and reset edited flags
    setProcesses(prev => prev.map(process => ({
      ...process,
      originalScore: process.score,
      edited: false
    })));
    
    setSaving(false);
    
    // Navigate back to the assessment view
    navigate(`/assessments/${assessmentId}`);
  };

  const hasChanges = processes.some(process => process.edited);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray">Loading assessment data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            to={`/assessments/${assessmentId}`}
            className="flex items-center space-x-2 text-blue hover:text-blue-dark transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Assessment</span>
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="font-bree text-2xl text-blue-dark">Edit Assessment Scores</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`
            flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors
            ${hasChanges
              ? 'bg-blue text-white hover:bg-blue-dark'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-6">
          <h2 className="font-bree text-xl text-blue-dark">{companyName}</h2>
          <p className="text-gray">
            Domain: <span className="font-semibold">{domainTitle}</span> | 
            Category: <span className="font-semibold">{categoryTitle}</span>
          </p>
        </div>

        <div className="relative mb-4">
          <div className="flex items-center justify-end mb-2">
            <button
              onClick={() => setShowScoreHelp(!showScoreHelp)}
              className="flex items-center space-x-1 text-sm text-gray hover:text-blue transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Scoring Guidelines</span>
            </button>
          </div>

          {showScoreHelp && (
            <div className="absolute right-0 top-8 z-10 w-72 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
              <h3 className="font-bree text-blue-dark mb-2">Maturity Scoring Scale (0-5)</h3>
              <ul className="text-sm space-y-2">
                <li><span className="font-semibold">0:</span> Non-existent</li>
                <li><span className="font-semibold">1:</span> Initial / Ad-hoc</li>
                <li><span className="font-semibold">2:</span> Repeatable but intuitive</li>
                <li><span className="font-semibold">3:</span> Defined process</li>
                <li><span className="font-semibold">4:</span> Managed and measurable</li>
                <li><span className="font-semibold">5:</span> Optimized</li>
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {processes.map(process => (
            <div 
              key={process.id} 
              className={`p-4 rounded-lg border ${process.edited ? 'border-blue bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="font-din text-lg text-gray-700">{process.name}</h3>
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <span className="text-sm text-gray">Maturity Score (0-5):</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="1"
                    value={process.score}
                    onChange={(e) => handleScoreChange(process.id, parseFloat(e.target.value))}
                    className={`
                      w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                      ${process.edited 
                        ? 'border-blue focus:ring-blue' 
                        : 'border-gray-200 focus:ring-blue-light'
                      }
                    `}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor={`notes-${process.id}`} className="block text-sm text-gray mb-2">
                  Assessment Notes:
                </label>
                <textarea
                  id={`notes-${process.id}`}
                  value={process.notes}
                  onChange={(e) => handleNotesChange(process.id, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Add assessment notes for this process..."
                />
              </div>
              
              {process.edited && (
                <div className="mt-2 text-sm text-blue">
                  <p>Score changed from {process.originalScore.toFixed(1)} to {process.score.toFixed(1)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}