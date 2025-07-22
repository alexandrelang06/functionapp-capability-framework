import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Eye, AlertCircle, RefreshCw, Database, Edit, Calculator, RotateCcw, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFramework } from '../contexts/FrameworkContext';
import { useCategoryScores } from '../contexts/CategoryScoresContext';
import { calculateProcessScore, calculateCategoryScore, calculateDomainScore } from '../lib/scoreUtils';
import { supabase, handleDatabaseError, checkDatabaseConnection, testDatabaseStatus } from '../lib/supabase';

interface ProcessDescription {
  id: string;
  short_description: string | null;
}

interface AssessmentScore {
  process_id: string;
  score: number;
  notes?: string;
  priority?: boolean;
}

interface ITCapabilityFrameworkProps {
  scores?: AssessmentScore[];
  readOnly?: boolean;
  showHeatmap?: boolean;
  assessmentId?: string;
  isOpen?: boolean;
  onProcessClick?: (processId: string) => void;
}

// Mapping des couleurs spécifiques pour chaque macro-processus
const CATEGORY_COLORS: Record<string, string> = {
  'IT STRATEGY': '#78C7E2',
  'PORTFOLIO MANAGEMENT': '#78C7E2',
  'CYBERSECURITY GOVERNANCE': '#78C7E2',
  'IT-RISK AND COMPLIANCE': '#78C7E2',
  'DATA GOVERNANCE': '#78C7E2',
  'ENTERPRISE ARCHITECTURE': '#78C7E2',
  'TECHNOLOGY STRATEGY': '#78C7E2',
  'BUSINESS RELATIONSHIP': '#9395C7',
  'DEMAND MANAGEMENT': '#9395C7',
  'PROJECTS & PROGRAMS DELIVERY': '#879BC5',
  'SOLUTIONS ENGINEERING': '#879BC5',
  'SOLUTIONS OPERATIONS': '#6490B8',
  'CYBERSECURITY OPERATIONS': '#6490B8',
  'SUPPORT & IMPROVEMENT': '#7EA3C4',
  'IT FINANCE & CONTROLLING': '#67adbf',
  'IT ORGANIZATION & HR': '#67adbf',
  'IT ASSET MANAGEMENT': '#67adbf',
  'IT SOURCING & PROCUREMENT': '#67adbf'
};

export function ITCapabilityFramework({ 
  scores = [], 
  readOnly = false, 
  showHeatmap = false,
  assessmentId,
  isOpen = false,
  onProcessClick
}: ITCapabilityFrameworkProps) {
  const navigate = useNavigate();
  const { frameworkData } = useFramework();
  const { 
    categoryScores, 
    updateCategoryScore, 
    getCategoryScore 
  } = useCategoryScores();
  
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [expandedMacroProcesses, setExpandedMacroProcesses] = useState<Record<string, boolean>>({});
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [processDescriptions, setProcessDescriptions] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [editingCategoryScore, setEditingCategoryScore] = useState<string | null>(null);
  const [savingCategoryScore, setSavingCategoryScore] = useState<string | null>(null);

  const getDefaultDescriptions = () => {
    return frameworkData
      .flatMap(domain => domain.categories)
      .flatMap(category => category.processes)
      .reduce((acc, process) => ({
        ...acc,
        [process.id]: 'En cours de définition'
      }), {});
  };

  const getProcessScore = (processId: string): number => {
    const score = scores.find(s => s.process_id === processId);
    return score?.score ?? null;
  };

  const fetchProcessDescriptions = async (showRetryIndicator = false) => {
    try {
      if (showRetryIndicator) {
        setIsRetrying(true);
      }
      
      setConnectionStatus('checking');
      setFetchError(null);
      
      // First set default descriptions to ensure UI works even if fetch fails
      setProcessDescriptions(getDefaultDescriptions());

      // Try to fetch from database, but don't block UI if service is unavailable
      try {
        console.log('🔍 Running database diagnostics...');
        const diagnostics = await testDatabaseStatus();
        setDiagnosticInfo(diagnostics);
        
        if (!diagnostics.available) {
          // If service is unavailable (503), continue with default descriptions
          if (diagnostics.message.includes('Service temporarily unavailable') || 
              diagnostics.message.includes('503')) {
            console.warn('⚠️ Database service temporarily unavailable, using default descriptions');
            setConnectionStatus('error');
            setFetchError('Database service temporarily unavailable. Using default process descriptions.');
            return; // Continue with default descriptions
          }
          throw new Error(diagnostics.message);
        }
      } catch (serviceError) {
        // Handle 503 and other service errors gracefully
        const errorMessage = handleDatabaseError(serviceError);
        if (errorMessage.includes('Service temporarily unavailable') || 
            errorMessage.includes('503') ||
            errorMessage.includes('Could not query the database for the schema cache')) {
          console.warn('⚠️ Database service temporarily unavailable, using default descriptions');
          setConnectionStatus('error');
          setFetchError('Database service temporarily unavailable. Using default process descriptions.');
          return; // Continue with default descriptions
        }
        throw serviceError; // Re-throw other errors
      }
      
      const { data, error } = await supabase
        .from('processes')
        .select('id, short_description')
        .limit(1000);

      if (error) {
        console.error('Error fetching process descriptions:', error);
        const errorMessage = handleDatabaseError(error);
        
        // Handle 503 errors gracefully
        if (errorMessage.includes('Service temporarily unavailable') || 
            errorMessage.includes('503')) {
          console.warn('⚠️ Database service temporarily unavailable, using default descriptions');
          setFetchError('Database service temporarily unavailable. Using default process descriptions.');
          setConnectionStatus('error');
          return; // Continue with default descriptions
        }
        
        setFetchError(errorMessage);
        setConnectionStatus('error');
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No processes found in database');
        setFetchError('No processes found in database. The framework data may not be loaded.');
        setConnectionStatus('error');
        return;
      }

      const descriptions = (data as ProcessDescription[]).reduce((acc, process) => ({
        ...acc,
        [process.id]: process.short_description || 'En cours de définition'
      }), {});

      setProcessDescriptions(descriptions);
      setConnectionStatus('connected');
      setFetchError(null);
      console.log('✅ Successfully loaded', data.length, 'process descriptions');
    } catch (err) {
      console.error('Error fetching process descriptions:', err);
      const errorMessage = handleDatabaseError(err);
      
      // Handle 503 errors gracefully
      if (errorMessage.includes('Service temporarily unavailable') || 
          errorMessage.includes('503') ||
          errorMessage.includes('Could not query the database for the schema cache')) {
        console.warn('⚠️ Database service temporarily unavailable, using default descriptions');
        setFetchError('Database service temporarily unavailable. Using default process descriptions.');
      } else {
        setFetchError(errorMessage);
      }
      setConnectionStatus('error');
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchProcessDescriptions();
  }, [frameworkData]);

  const handleRetry = () => {
    fetchProcessDescriptions(true);
  };

  const formatScore = (score: number): string => {
    return score ? Math.round(score).toString() : 'N/A';
  };

  const formatAggregateScore = (score: number): string => {
    return score ? (Math.round(score * 10) / 10).toFixed(1) : 'N/A';
  };

  const getScoreColor = (score: number): { bg: string; text: string } => {
    if (!score) return { bg: '#f8fafc', text: '#374151' };
    if (score < 2) return { bg: '#fee2e2', text: '#7f1d1d' };
    if (score < 3) return { bg: '#fef3c7', text: '#78350f' };
    if (score < 4) return { bg: '#e6fccf', text: '#365314' };
    return { bg: '#dcfce7', text: '#14532d' };
  };

  const getDomainColor = (domainId: string): string => {
    if (['plan-strategy', 'manage-architecture', 'govern-technology'].includes(domainId)) {
      return '#00799a';
    }
    if (['manage-demand', 'deliver-solutions', 'operate-solutions', 'support-users'].includes(domainId)) {
      return '#9395c7';
    }
    return '#67adbf';
  };

  const getCategoryBackground = (categoryTitle: string): string => {
    return CATEGORY_COLORS[categoryTitle] || '#67adbf';
  };

  const getProcessNumberColor = (domainId: string): string => {
    if (['plan-strategy', 'manage-architecture', 'govern-technology'].includes(domainId)) {
      return '#0284c7';
    }
    if (['manage-demand', 'deliver-solutions', 'operate-solutions', 'support-users'].includes(domainId)) {
      return '#9333ea';
    }
    return '#0d9488';
  };

  const getProcessNumberBackground = (domainId: string): string => {
    if (['plan-strategy', 'manage-architecture', 'govern-technology'].includes(domainId)) {
      return '#78c6e2';
    }
    if (['manage-demand', 'deliver-solutions', 'operate-solutions', 'support-users'].includes(domainId)) {
      return '#9395c7';
    }
    return '#67adbf';
  };

  const handleCategoryScoreChange = async (categoryId: string, newScore: number | null, isManual: boolean) => {
    if (!assessmentId) return;
    
    try {
      setSavingCategoryScore(categoryId);
      setFetchError(null);

      await updateCategoryScore(assessmentId, categoryId, newScore, isManual);
      
      // Reset editing state
      setEditingCategoryScore(null);
      
    } catch (err) {
      console.error('Error updating category score:', err);
      const errorMessage = handleDatabaseError(err);
      setFetchError(`Failed to update category score: ${errorMessage}`);
      
      if (errorMessage.includes('Network connection') || errorMessage.includes('timed out')) {
        setConnectionStatus('error');
      }
    } finally {
      setSavingCategoryScore(null);
    }
  };

  const handleResetToAutomatic = async (categoryId: string) => {
    // Calculate the automatic score first
    const targetCategory = frameworkData
      .flatMap(d => d.categories)
      .find(c => c.id === categoryId);
      
    if (targetCategory) {
      const processScores = scores.map(s => ({
        processId: s.process_id,
        score: s.score
      }));
      
      const calculatedScore = calculateCategoryScore(processScores, targetCategory);
      
      // Save the calculated score (or null if no processes scored)
      const scoreToSave = calculatedScore > 0 ? calculatedScore : null;
      await handleCategoryScoreChange(categoryId, scoreToSave, false);
    }
  };

  const getCategoryScoreEntry = (categoryId: string) => {
    return getCategoryScore(categoryId);
  };

  const calculateFinalCategoryScore = (categoryId: string): number => {
    // Check if we have a score stored in database for this category
    const manualScoreEntry = getCategoryScore(categoryId);
    if (manualScoreEntry && manualScoreEntry.manual_score !== null) {
      return manualScoreEntry.manual_score;
    }
    
    // Otherwise calculate from process scores
    const categoryProcesses = frameworkData
      .flatMap(d => d.categories)
      .find(c => c.id === categoryId);

    if (!categoryProcesses) return 0;
    return calculateCategoryScore(scores, categoryProcesses);
  };

  const getDomainScore = (domainId: string): number => {
    const domain = frameworkData.find(d => d.id === domainId);
    if (!domain) return 0;
    return calculateDomainScore(scores, domain, categoryScores);
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };

  const toggleMacroProcess = (categoryId: string) => {
    setExpandedMacroProcesses(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleViewDetails = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    const category = frameworkData
      .flatMap(d => d.categories)
      .find(c => c.id === categoryId);
    
    if (category) {
      const processIds = category.processes.map(p => p.id);
      navigate(assessmentId 
        ? `/assessments/${assessmentId}/processes/${processIds.join(',')}` 
        : `/framework/processes/${processIds.join(',')}`
      );
    }
  };

  const renderProcess = (process: { id: string; name: string }, index: number, domainId: string, categoryTitle: string) => {
    const categoryColor = getCategoryBackground(categoryTitle);
    
    return (
      <li
        key={process.id}
        className={`relative py-1 px-3 text-xs ml-0 flex justify-between items-center rounded group ${assessmentId ? 'cursor-pointer' : 'cursor-help'} relative`}
        style={{ 
          backgroundColor: showHeatmap && getProcessScore(process.id) !== null ? getScoreColor(getProcessScore(process.id)).bg : 'transparent',
          color: showHeatmap && getProcessScore(process.id) !== null ? getScoreColor(getProcessScore(process.id)).text : '#374151',
          borderLeft: `3px solid ${categoryColor}`
        }}
        onClick={onProcessClick ? () => onProcessClick(process.id) : undefined}
      >
        <div 
          className={`flex items-center w-full justify-between ${connectionStatus === 'error' ? 'opacity-75' : ''} relative`}
        >
          <div className="flex items-center space-x-2">
            <span className="transition-colors">{process.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            {scores.find(s => s.process_id === process.id && s.priority) && (
              <div className="flex items-center space-x-1.5 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-yellow-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-yellow-600 font-medium">Prioritaire</span>
              </div>
            )}
            {getProcessScore(process.id) > 0 && (
              <div className="flex items-center space-x-1">
                <span className="font-bold text-sm bg-white/50 px-2 py-1 rounded">
                  {formatScore(getProcessScore(process.id))}
                </span>
              </div>
            )}
          </div>
        </div>
      </li>
    );
  };

  // Réorganisation des domaines pour un alignement optimal
  const firstRowDomains = frameworkData.slice(0, 3); // Plan strategy, Govern technology, Manage architecture
  const secondRowDomains = frameworkData.slice(3, 7); // Manage demand, Deliver solutions, Operate solutions, Support users
  const thirdRowDomains = frameworkData.slice(7); // Steer Resources

  return (
    <div className="space-y-8">
      {/* Connection Status Banner */}
      {connectionStatus === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Database Connection Issue</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {fetchError || 'Unable to connect to the database. Using default process descriptions.'}
                </p>
                {diagnosticInfo && !diagnosticInfo.available && (
                  <details className="mt-2">
                    <summary className="text-xs text-yellow-600 cursor-pointer">Show diagnostic details</summary>
                    <pre className="text-xs text-yellow-600 mt-1 bg-yellow-100 p-2 rounded">
                      {JSON.stringify(diagnosticInfo.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
              </button>
              <button
                onClick={() => window.open('https://status.supabase.com', '_blank')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm font-medium transition-colors"
              >
                <Database className="h-4 w-4" />
                <span>Check Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Success Indicator */}
      {false && connectionStatus === 'connected' && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">
              Database connected successfully {diagnosticInfo.details?.responseTime && `(${diagnosticInfo.details.responseTime}ms)`}
            </span>
          </div>
        </div>
      )}

      {showHeatmap && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bree text-xl text-blue-dark">Process Maturity Heatmap</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Maturity Score Legend:</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fee2e2' }}></div>
                <span className="text-sm">1-2</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef3c7' }}></div>
                <span className="text-sm">2-3</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e6fccf' }}></div>
                <span className="text-sm">3-4</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7' }}></div>
                <span className="text-sm">4-5</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Première ligne - Niveau Haut (3 domaines) */}
      <div className="grid grid-cols-3 gap-4 pb-8 border-b-2 border-gray-100">
        {firstRowDomains.map(domain => {
          const domainScore = getDomainScore(domain.id);
          const scoreColors = showHeatmap ? getScoreColor(domainScore) : { bg: '#f8fafc', text: '#374151' };
          
          return (
            <div key={domain.id} className="flex flex-col h-full">
              <div 
                className="p-4 rounded-lg text-center border border-gray-200 shadow-sm flex justify-between items-center"
                style={{ 
                  backgroundColor: scoreColors.bg,
                  color: scoreColors.text
                }}
              >
                <h3 className="font-bree text-xl">{domain.title}</h3>
                {showHeatmap && domainScore > 0 && (
                  <span className="font-bold">{formatAggregateScore(domainScore)}</span>
                )}
              </div>
              
              <div className="flex-1 mt-4">
                {domain.categories.map(category => {
                  const categoryScore = calculateFinalCategoryScore(category.id);
                  const categoryScoreEntry = getCategoryScoreEntry(category.id);
                  const categoryColors = showHeatmap ? getScoreColor(categoryScore) : { bg: getCategoryBackground(category.title), text: '#ffffff' };
                  const isEditingThisCategory = editingCategoryScore === category.id;
                  const isSavingThisCategory = savingCategoryScore === category.id;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-4 w-[90%] mx-auto last:mb-0"
                    >
                      <div
                        className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
                          selectedProcess === category.id ? 'ring-2 ring-gold' : ''
                        }`}
                        onMouseEnter={() => setSelectedProcess(category.id)}
                        onMouseLeave={() => setSelectedProcess(null)}
                      >
                        <div 
                          className="p-3 cursor-pointer flex items-center justify-between"
                          onClick={() => toggleMacroProcess(category.id)}
                          style={{ 
                            backgroundColor: categoryColors.bg,
                            color: categoryColors.text
                          }}
                        >
                          <div className="flex items-center">
                            <h4 className="font-bree text-base uppercase">
                              {category.title}
                            </h4>
                            {expandedMacroProcesses[category.id] ? (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-2" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {showHeatmap && (
                              <div className="flex items-center space-x-2">
                                {isEditingThisCategory ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="relative">
                                      <select
                                        value={categoryScoreEntry?.is_manual ? (categoryScoreEntry?.manual_score || 'N/A') : 'auto'}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === 'auto') {
                                            handleCategoryScoreChange(category.id, null, false);
                                          } else if (value === 'N/A') {
                                            handleCategoryScoreChange(category.id, null, true);
                                          } else {
                                            handleCategoryScoreChange(category.id, Number(value), true);
                                          }
                                        }}
                                        disabled={isSavingThisCategory}
                                        className="border rounded px-2 py-1 text-sm pr-6"
                                        style={{ 
                                          backgroundColor: categoryColors.bg,
                                          color: categoryColors.text,
                                          borderColor: categoryColors.text
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="auto" style={{backgroundColor: '#1f2937', color: 'white'}}>Auto (calculé)</option>
                                        <option value="N/A" style={{backgroundColor: '#1f2937', color: 'white'}}>N/A</option>
                                        <option value="1" style={{backgroundColor: '#1f2937', color: 'white'}}>1</option>
                                        <option value="2" style={{backgroundColor: '#1f2937', color: 'white'}}>2</option>
                                        <option value="3" style={{backgroundColor: '#1f2937', color: 'white'}}>3</option>
                                        <option value="4" style={{backgroundColor: '#1f2937', color: 'white'}}>4</option>
                                        <option value="5" style={{backgroundColor: '#1f2937', color: 'white'}}>5</option>
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                                        <ChevronDown className="h-3 w-3" style={{ color: categoryColors.text }} />
                                      </div>
                                    </div>
                                    {isSavingThisCategory && (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-bold">{formatAggregateScore(categoryScore)}</span>
                                    {assessmentId && isOpen && (
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCategoryScore(category.id);
                                          }}
                                          className="p-1 hover:bg-white/10 rounded transition-colors"
                                          title="Modifier le score"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        {categoryScoreEntry?.is_manual && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleResetToAutomatic(category.id);
                                            }}
                                            disabled={isSavingThisCategory}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                            title="Repasser en mode automatique"
                                          >
                                            <RotateCcw className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                            {showHeatmap && isOpen && !isEditingThisCategory && (
                              <button
                                onClick={(e) => handleViewDetails(e, category.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" style={{ color: categoryColors.text }} />
                              </button>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedMacroProcesses[category.id] && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-3">
                                <ul className="space-y-0.5">
                                  {category.processes.map((process, index) => 
                                    renderProcess(process, index, domain.id, category.title)
                                  )}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deuxième ligne - Niveau Milieu (4 domaines alignés horizontalement) */}
      <div className="grid grid-cols-4 gap-4 pb-8 border-b-2 border-gray-100">
        {secondRowDomains.map(domain => {
          const domainScore = getDomainScore(domain.id);
          const scoreColors = showHeatmap ? getScoreColor(domainScore) : { bg: '#f8fafc', text: '#374151' };
          
          return (
            <div key={domain.id} className="flex flex-col h-full">
              <div 
                className="p-4 rounded-lg text-center border border-gray-200 shadow-sm flex justify-between items-center"
                style={{ 
                  backgroundColor: scoreColors.bg,
                  color: scoreColors.text
                }}
              >
                <h3 className="font-bree text-xl">{domain.title}</h3>
                {showHeatmap && domainScore > 0 && (
                  <span className="font-bold">{formatAggregateScore(domainScore)}</span>
                )}
              </div>
              
              <div className="flex-1 mt-4">
                {domain.categories.map(category => {
                  const categoryScore = calculateFinalCategoryScore(category.id);
                  const categoryScoreEntry = getCategoryScoreEntry(category.id);
                  const categoryColors = showHeatmap ? getScoreColor(categoryScore) : { bg: getCategoryBackground(category.title), text: '#ffffff' };
                  const isEditingThisCategory = editingCategoryScore === category.id;
                  const isSavingThisCategory = savingCategoryScore === category.id;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-4 w-[90%] mx-auto last:mb-0"
                    >
                      <div
                        className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
                          selectedProcess === category.id ? 'ring-2 ring-gold' : ''
                        }`}
                        onMouseEnter={() => setSelectedProcess(category.id)}
                        onMouseLeave={() => setSelectedProcess(null)}
                      >
                        <div 
                          className="p-3 cursor-pointer flex items-center justify-between"
                          onClick={() => toggleMacroProcess(category.id)}
                          style={{ 
                            backgroundColor: categoryColors.bg,
                            color: categoryColors.text
                          }}
                        >
                          <div className="flex items-center">
                            <h4 className="font-bree text-base uppercase">
                              {category.title}
                            </h4>
                            {expandedMacroProcesses[category.id] ? (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-2" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {showHeatmap && (
                              <div className="flex items-center space-x-2">
                                {isEditingThisCategory ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="relative">
                                      <select
                                        value={categoryScoreEntry?.is_manual ? (categoryScoreEntry?.manual_score || 'N/A') : 'auto'}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === 'auto') {
                                            handleCategoryScoreChange(category.id, null, false);
                                          } else if (value === 'N/A') {
                                            handleCategoryScoreChange(category.id, null, true);
                                          } else {
                                            handleCategoryScoreChange(category.id, Number(value), true);
                                          }
                                        }}
                                        disabled={isSavingThisCategory}
                                        className="border rounded px-2 py-1 text-sm pr-6"
                                        style={{ 
                                          backgroundColor: categoryColors.bg,
                                          color: categoryColors.text,
                                          borderColor: categoryColors.text
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="auto" style={{backgroundColor: '#1f2937', color: 'white'}}>Auto (calculé)</option>
                                        <option value="N/A" style={{backgroundColor: '#1f2937', color: 'white'}}>N/A</option>
                                        <option value="1" style={{backgroundColor: '#1f2937', color: 'white'}}>1</option>
                                        <option value="2" style={{backgroundColor: '#1f2937', color: 'white'}}>2</option>
                                        <option value="3" style={{backgroundColor: '#1f2937', color: 'white'}}>3</option>
                                        <option value="4" style={{backgroundColor: '#1f2937', color: 'white'}}>4</option>
                                        <option value="5" style={{backgroundColor: '#1f2937', color: 'white'}}>5</option>
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                                        <ChevronDown className="h-3 w-3" style={{ color: categoryColors.text }} />
                                      </div>
                                    </div>
                                    {isSavingThisCategory && (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-bold">{formatAggregateScore(categoryScore)}</span>
                                    {assessmentId && isOpen && (
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCategoryScore(category.id);
                                          }}
                                          className="p-1 hover:bg-white/10 rounded transition-colors"
                                          title="Modifier le score"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        {categoryScoreEntry?.is_manual && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleResetToAutomatic(category.id);
                                            }}
                                            disabled={isSavingThisCategory}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                            title="Repasser en mode automatique"
                                          >
                                            <RotateCcw className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                            {showHeatmap && isOpen && !isEditingThisCategory && (
                              <button
                                onClick={(e) => handleViewDetails(e, category.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" style={{ color: categoryColors.text }} />
                              </button>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedMacroProcesses[category.id] && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-3">
                                <ul className="space-y-0.5">
                                  {category.processes.map((process, index) => 
                                    renderProcess(process, index, domain.id, category.title)
                                  )}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Troisième ligne - Niveau Bas (1 domaine) */}
      <div className="grid grid-cols-1 gap-4">
        {thirdRowDomains.map(domain => {
          const domainScore = getDomainScore(domain.id);
          const scoreColors = showHeatmap ? getScoreColor(domainScore) : { bg: '#f8fafc', text: '#374151' };
          
          return (
            <div key={domain.id} className="flex flex-col h-full">
              <div 
                className="p-4 rounded-lg text-center border border-gray-200 shadow-sm flex justify-between items-center"
                style={{ 
                  backgroundColor: scoreColors.bg,
                  color: scoreColors.text
                }}
              >
                <h3 className="font-bree text-xl">{domain.title}</h3>
                {showHeatmap && domainScore > 0 && (
                  <span className="font-bold">{formatAggregateScore(domainScore)}</span>
                )}
              </div>
              
              <div className="flex-1 grid grid-cols-4 gap-4 mt-4">
                {domain.categories.map(category => {
                  const categoryScore = calculateFinalCategoryScore(category.id);
                  const categoryScoreEntry = getCategoryScoreEntry(category.id);
                  const categoryColors = showHeatmap ? getScoreColor(categoryScore) : { bg: getCategoryBackground(category.title), text: '#ffffff' };
                  const isEditingThisCategory = editingCategoryScore === category.id;
                  const isSavingThisCategory = savingCategoryScore === category.id;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-4 w-[90%] mx-auto last:mb-0"
                    >
                      <div
                        className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
                          selectedProcess === category.id ? 'ring-2 ring-gold' : ''
                        }`}
                        onMouseEnter={() => setSelectedProcess(category.id)}
                        onMouseLeave={() => setSelectedProcess(null)}
                      >
                        <div 
                          className="p-3 cursor-pointer flex items-center justify-between"
                          onClick={() => toggleMacroProcess(category.id)}
                          style={{ 
                            backgroundColor: categoryColors.bg,
                            color: categoryColors.text
                          }}
                        >
                          <div className="flex items-center">
                            <h4 className="font-bree text-base uppercase">
                              {category.title}
                            </h4>
                            {expandedMacroProcesses[category.id] ? (
                              <ChevronDown className="h-4 w-4 ml-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-2" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {showHeatmap && (
                              <div className="flex items-center space-x-2">
                                {isEditingThisCategory ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="relative">
                                      <select
                                        value={categoryScoreEntry?.is_manual ? (categoryScoreEntry?.manual_score || 'N/A') : 'auto'}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === 'auto') {
                                            handleCategoryScoreChange(category.id, null, false);
                                          } else if (value === 'N/A') {
                                            handleCategoryScoreChange(category.id, null, true);
                                          } else {
                                            handleCategoryScoreChange(category.id, Number(value), true);
                                          }
                                        }}
                                        disabled={isSavingThisCategory}
                                        className="border rounded px-2 py-1 text-sm pr-6"
                                        style={{ 
                                          backgroundColor: categoryColors.bg,
                                          color: categoryColors.text,
                                          borderColor: categoryColors.text
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="auto" style={{backgroundColor: '#1f2937', color: 'white'}}>Auto (calculé)</option>
                                        <option value="N/A" style={{backgroundColor: '#1f2937', color: 'white'}}>N/A</option>
                                        <option value="1" style={{backgroundColor: '#1f2937', color: 'white'}}>1</option>
                                        <option value="2" style={{backgroundColor: '#1f2937', color: 'white'}}>2</option>
                                        <option value="3" style={{backgroundColor: '#1f2937', color: 'white'}}>3</option>
                                        <option value="4" style={{backgroundColor: '#1f2937', color: 'white'}}>4</option>
                                        <option value="5" style={{backgroundColor: '#1f2937', color: 'white'}}>5</option>
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                                        <ChevronDown className="h-3 w-3" style={{ color: categoryColors.text }} />
                                      </div>
                                    </div>
                                    {isSavingThisCategory && (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-bold">{formatAggregateScore(categoryScore)}</span>
                                    {assessmentId && isOpen && (
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCategoryScore(category.id);
                                          }}
                                          className="p-1 hover:bg-white/10 rounded transition-colors"
                                          title="Modifier le score"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        {categoryScoreEntry?.is_manual && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleResetToAutomatic(category.id);
                                            }}
                                            disabled={isSavingThisCategory}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                            title="Repasser en mode automatique"
                                          >
                                            <RotateCcw className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                            {showHeatmap && isOpen && !isEditingThisCategory && (
                              <button
                                onClick={(e) => handleViewDetails(e, category.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" style={{ color: categoryColors.text }} />
                              </button>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedMacroProcesses[category.id] && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-3">
                                <ul className="space-y-0.5">
                                  {category.processes.map((process, index) => 
                                    renderProcess(process, index, domain.id, category.title)
                                  )}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}