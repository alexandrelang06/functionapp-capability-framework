import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Save, Edit2, ChevronDown, ChevronUp, Calculator, Edit, RefreshCw, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useFramework } from '../contexts/FrameworkContext';
import { useCategoryScores } from '../contexts/CategoryScoresContext';
import { calculateCategoryScore } from '../lib/scoreUtils';
import { supabase, checkServiceStatus, handleDatabaseError } from '../lib/supabase';

interface Process {
  id: string;
  name: string;
  description: string[];
  key_questions: string[];
  key_artifacts: string[];
  maturity_levels: Record<string, string>;
  short_description: string;
  current_score?: number;
}

interface Score {
  id: string;
  process_id: string;
  score: number;
  notes: string;
  priority: boolean;
}

export function ProcessDetails() {
  const { processIds, assessmentId } = useParams<{ processIds: string; assessmentId?: string }>();
  const navigate = useNavigate();
  const { frameworkData } = useFramework();
  const { 
    categoryScores, 
    updateCategoryScore, 
    getCategoryScore 
  } = useCategoryScores();
  
  // Memoize processIdArray to prevent unnecessary re-renders
  const processIdArray = useMemo(() => processIds?.split(',') || [], [processIds]);
  
  const [processes, setProcesses] = useState<Process[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  
  // Combine loading states to prevent flickering
  const [loadingState, setLoadingState] = useState({
    initial: true,
    data: false,
    connection: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [categoryTitle, setCategoryTitle] = useState('');
  const [domainTitle, setDomainTitle] = useState('');
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [savingScores, setSavingScores] = useState<Record<string, boolean>>({});
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isEditingCategoryScore, setIsEditingCategoryScore] = useState(false);
  const [savingCategoryScore, setSavingCategoryScore] = useState(false);

  const scoreOptions = [
    { value: 'N/A', label: 'N/A' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' }
  ];

  const toggleLevel = useCallback((processId: string, level: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [`${processId}-${level}`]: !prev[`${processId}-${level}`]
    }));
  }, []);

  const toggleAllLevels = useCallback(() => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    
    const allCombinations = processes.reduce((acc, process) => {
      Object.keys(process.maturity_levels).forEach(level => {
        acc[`${process.id}-${level}`] = newState;
      });
      return acc;
    }, {} as Record<string, boolean>);
    
    setExpandedLevels(allCombinations);
  }, [allExpanded, processes]);

  const getFirstSentence = useCallback((text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : text;
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      setLoadingState(prev => ({ ...prev, connection: true }));
      setConnectionStatus('checking');
      const status = await checkServiceStatus();
      setConnectionStatus(status.available ? 'connected' : 'disconnected');
      if (!status.available) {
        setError(status.message);
      }
      return status.available;
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionStatus('disconnected');
      setError(handleDatabaseError(err));
      return false;
    } finally {
      setLoadingState(prev => ({ ...prev, connection: false }));
    }
  }, []);

  const retryConnection = useCallback(async () => {
    setError(null);
    const isConnected = await checkConnection();
    if (isConnected) {
      fetchData();
    }
  }, [checkConnection]);

  const handleScoreChange = useCallback(async (processId: string, newScore: number | null) => {
    if (!assessmentId || savingScores[processId]) return;
    
    try {
      setSavingScores(prev => ({ ...prev, [processId]: true }));
      setError(null);

      const { data: result, error } = await supabase
        .from('scores')
        .upsert({
          assessment_id: assessmentId,
          process_id: processId,
          score: newScore,
          notes: scores[processId]?.notes || ''
        }, {
          onConflict: 'assessment_id,process_id'
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!result) throw new Error('Failed to update score - no data returned');

      // Update local scores state immediately
      setScores(prev => ({
        ...prev,
        [processId]: result
      }));
      
      // Automatically update category score if in automatic mode
      if (categoryId) {
        try {
          // Find the category in framework data
          const category = frameworkData
            .flatMap(d => d.categories)
            .find(c => c.id === categoryId);
            
          if (category) {
            // Get current category score entry
            const categoryScoreEntry = getCategoryScore(categoryId);
            
            // Only update if category is in automatic mode (not manual)
            if (!categoryScoreEntry?.is_manual) {
              // Calculate new category score with updated process scores
              const updatedScores = {
                ...scores,
                [processId]: result
              };
              
              const processScores = Object.values(updatedScores).map(s => ({
                processId: s.process_id,
                score: s.score
              }));
              
              const calculatedCategoryScore = calculateCategoryScore(processScores, category);
              
              // Persist the calculated score to database
              if (calculatedCategoryScore > 0) {
                await updateCategoryScore(assessmentId, categoryId, calculatedCategoryScore, false);
              }
            }
          }
        } catch (categoryError) {
          console.error('Error updating category score:', categoryError);
          // Don't throw - category score update failure shouldn't prevent process score update
        }
      }
      
    } catch (err) {
      console.error('Error updating score:', err);
      const errorMessage = handleDatabaseError(err);
      setError(`Failed to update score: ${errorMessage}`);
      
      if (errorMessage.includes('Network connection') || errorMessage.includes('timed out')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setSavingScores(prev => ({ ...prev, [processId]: false }));
    }
  }, [assessmentId, scores, categoryId, frameworkData, getCategoryScore, updateCategoryScore, handleDatabaseError]);

  const handleCategoryScoreChange = useCallback(async (newScore: number | null, isManual: boolean) => {
    if (!assessmentId || !categoryId) return;
    
    try {
      setSavingCategoryScore(true);
      setError(null);

      // Determine the score to save and the manual flag
      let newScoreToSave = newScore;
      let isManualFlag = isManual;
      
      // If switching to automatic mode, calculate the score based on process scores
      if (!isManual) {
        const category = frameworkData
          .flatMap(d => d.categories)
          .find(c => c.id === categoryId);
          
        if (category) {
          const processScores = Object.values(scores).map(s => ({
            processId: s.process_id,
            score: s.score
          }));
          
          newScoreToSave = calculateCategoryScore(processScores, category);
          
          // If calculated score is 0 (no processes scored), store as null to satisfy DB constraint
          if (newScoreToSave === 0) {
            newScoreToSave = null;
          }
        }
      }
      await updateCategoryScore(assessmentId, categoryId, newScoreToSave, isManualFlag);
      
      setIsEditingCategoryScore(false);
      
    } catch (err) {
      console.error('Error updating category score:', err);
      const errorMessage = handleDatabaseError(err);
      setError(`Failed to update category score: ${errorMessage}`);
      
      if (errorMessage.includes('Network connection') || errorMessage.includes('timed out')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setSavingCategoryScore(false);
    }
  }, [assessmentId, categoryId, updateCategoryScore]);

  const handleResetToAutomatic = useCallback(async () => {
    if (!assessmentId || !categoryId) return;
    
    try {
      setSavingCategoryScore(true);
      setError(null);

      // Reset to automatic mode
      await handleCategoryScoreChange(null, false);
      
    } catch (err) {
      console.error('Error resetting to automatic mode:', err);
      const errorMessage = handleDatabaseError(err);
      setError(`Failed to reset to automatic mode: ${errorMessage}`);
    } finally {
      setSavingCategoryScore(false);
    }
  }, [assessmentId, categoryId, handleCategoryScoreChange]);

  const getCurrentCategoryScore = useCallback(() => {
    const categoryScoreEntry = getCategoryScore(categoryId);
    
    if (categoryScoreEntry?.is_manual && categoryScoreEntry?.manual_score !== null) {
      return categoryScoreEntry.manual_score;
    }
    
    const category = frameworkData
      .flatMap(d => d.categories)
      .find(c => c.id === categoryId);
      
    if (category) {
      const processScores = Object.values(scores).map(s => ({
        processId: s.process_id,
        score: s.score
      }));
      
      return calculateCategoryScore(processScores, category);
    }
    
    return 0;
  }, [categoryId, frameworkData, scores, getCategoryScore]);

  const formatCategoryScore = useCallback((score: number | null): string => {
    if (score === null) return 'N/A';
    return score.toFixed(1);
  }, []);

  const fetchData = useCallback(async () => {
    if (!processIdArray.length) {
      setError('No process IDs provided');
      setLoadingState({ initial: false, data: false, connection: false });
      return;
    }

    try {
      setLoadingState(prev => ({ ...prev, data: true }));
      setError(null);

      console.log('Fetching data for processes:', processIdArray);

      const [processesResponse, scoresResponse, categoriesResponse] = await Promise.all([
        supabase.from('processes')
          .select(`
            id,
            name,
            category_id,
            description,
            key_questions,
            key_artifacts,
            maturity_levels,
            short_description
          `)
          .in('id', processIdArray)
          .order('order_index'),
        
        assessmentId ? supabase
          .from('scores')
          .select('*')
          .eq('assessment_id', assessmentId)
          .in('process_id', processIdArray) : Promise.resolve({ data: null }),
        
        supabase
          .from('categories')
          .select(`*,
            title,
            domains!inner (
              title
            )
          `)
      ]);

      const { data: processesData, error: processesError } = processesResponse;
      const { data: scoresData, error: scoresError } = scoresResponse;
      const { data: categoriesData, error: categoryError } = categoriesResponse;

      if (processesError) throw processesError;
      if (scoresError) throw scoresError;
      if (categoryError) throw categoryError;
      if (!processesData?.length) {
        throw new Error('No processes found. Please ensure your database has the framework data properly loaded.');
      }

      console.log('Successfully fetched:', {
        processes: processesData.length,
        scores: scoresData?.length || 0,
        categories: categoriesData?.length || 0
      });

      const categoryData = categoriesData?.find(c => c.id === processesData[0].category_id);
      
      let foundCategory = false;
      if (categoryData) {
        setCategoryId(categoryData.id);
        setCategoryTitle(categoryData.title);
        setDomainTitle(categoryData.domains.title);
        foundCategory = true;
      } else {
        const process = processesData?.[0];
        if (process) {
          for (const domain of frameworkData) {
            for (const category of domain.categories) {
              if (category.processes.some(p => p.id === process.id)) {
                setCategoryId(category.id);
                setCategoryTitle(category.title);
                setDomainTitle(domain.title);
                foundCategory = true;
                break;
              }
            }
            if (foundCategory) break;
          }
        }
      }
      
      if (!foundCategory) {
        throw new Error('Category information not found');
      }
      
      const formattedProcesses = processesData?.map(process => ({
        ...process,
        current_score: scoresData?.find(s => s.process_id === process.id)?.score || undefined,
        description: Array.isArray(process.description) ? process.description.filter(d => typeof d === 'string') : [],
        key_questions: Array.isArray(process.key_questions) ? process.key_questions.filter(q => typeof q === 'string') : [],
        key_artifacts: Array.isArray(process.key_artifacts) ? process.key_artifacts.filter(a => typeof a === 'string') : [],
        maturity_levels: typeof process.maturity_levels === 'object' && process.maturity_levels !== null
          ? Object.entries(process.maturity_levels).reduce((acc, [key, value]) => {
              if (typeof value === 'object' && value !== null && 'description' in value) {
                return {
                  ...acc,
                  [key]: value.description
                };
              }
              return {
                ...acc,
                [key]: typeof value === 'string' ? value : 'En cours de définition'
              };
            }, {})
          : { '1': 'En cours de définition', '2': 'En cours de définition', '3': 'En cours de définition', '4': 'En cours de définition', '5': 'En cours de définition' }
      })) || [];
      
      setProcesses(formattedProcesses);

      if (scoresData) {
        const scoresRecord = scoresData.reduce((acc, score) => ({
          ...acc,
          [score.process_id]: score
        }), {});
       
        setScores(scoresRecord);
      }

      setConnectionStatus('connected');

    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = handleDatabaseError(err);
      setError(errorMessage);
      
      if (errorMessage.includes('Network connection') || errorMessage.includes('timed out')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setLoadingState({ initial: false, data: false, connection: false });
    }
  }, [processIdArray, assessmentId, frameworkData]);

  // Single useEffect to handle initial data loading
  useEffect(() => {
    if (processIdArray.length && loadingState.initial) {
      checkConnection().then(isConnected => {
        if (isConnected) {
          fetchData();
        } else {
          setLoadingState({ initial: false, data: false, connection: false });
        }
      });
    }
  }, [processIdArray, loadingState.initial, checkConnection, fetchData]);

  // Get the background color for the current category
  const getCategoryBackground = (title: string): string => {
    const colorMap: Record<string, string> = {
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
      'IT FINANCE & CONTROLLING': '#6290B9',
      'IT ORGANIZATION & HR': '#6290B9',
      'IT ASSET MANAGEMENT': '#6290B9',
      'IT SOURCING & PROCUREMENT': '#6290B9'
    };
    
    return colorMap[title] || '#67adbf';
  };

  // Get the category background color
  const categoryBgColor = getCategoryBackground(categoryTitle);

  // Show loading only during initial load
  if (loadingState.initial || loadingState.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading process details...</p>
          {loadingState.connection && (
            <p className="text-sm text-gray-500 mt-2">Checking connection...</p>
          )}
        </div>
      </div>
    );
  }

  if (error && connectionStatus === 'disconnected') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <WifiOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p>Please check:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your internet connection</li>
              <li>Firewall or VPN settings</li>
              <li>Supabase service status</li>
            </ul>
          </div>
          <div className="space-x-3">
            <button 
              onClick={retryConnection}
              className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors inline-flex items-center space-x-2"
              disabled={loadingState.connection}
            >
              <RefreshCw className={`h-4 w-4 ${loadingState.connection ? 'animate-spin' : ''}`} />
              <span>Retry Connection</span>
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Connection Status Indicator */}
      {connectionStatus !== 'connected' && (
        <div className={`p-3 rounded-lg flex items-center space-x-2 ${
          connectionStatus === 'checking' ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'
        }`}>
          {connectionStatus === 'checking' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span className="text-sm">
            {connectionStatus === 'checking' ? 'Checking connection...' : 'Connection lost - some features may not work'}
          </span>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <Link 
          to={assessmentId ? `/assessments/${assessmentId}` : '/framework'}
          className="flex items-center space-x-2 text-gray hover:text-blue transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{assessmentId ? 'Back to Assessment' : 'Back to Framework'}</span>
        </Link>
        
        {/* Connection indicator */}
        <div className="flex items-center space-x-2">
          {connectionStatus === 'connected' ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : connectionStatus === 'checking' ? (
            <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-xs ${
            connectionStatus === 'connected' ? 'text-green-600' : 
            connectionStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'checking' ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-gray-500 mb-2">{domainTitle}</div>
        <h1 className="font-bree text-3xl text-blue-dark">{categoryTitle}</h1>
      </div>

      {assessmentId && (
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-sm p-4 text-center max-w-xs mx-auto">
          <div className="text-white/80 text-sm mb-1">Macro-processus Score</div>
          
          {isEditingCategoryScore ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="relative">
                <select
                  value={getCategoryScore(categoryId)?.is_manual ? (getCategoryScore(categoryId)?.manual_score || 'N/A') : 'auto'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'auto') {
                      handleCategoryScoreChange(null, false);
                    } else if (value === 'N/A') {
                      handleCategoryScoreChange(null, true);
                    } else {
                      handleCategoryScoreChange(Number(value), true);
                    }
                  }}
                  disabled={savingCategoryScore}
                  className="border rounded px-2 py-1 text-sm pr-6"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderColor: 'white'
                  }}
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
                  <ChevronDown className="h-3 w-3 text-white" />
                </div>
              </div>
              {savingCategoryScore && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <div className="font-bree text-3xl text-white">
                {formatCategoryScore(getCurrentCategoryScore())}
              </div>
              <button
                onClick={() => setIsEditingCategoryScore(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Modifier le score"
              >
                <Edit className="h-4 w-4 text-white/80" />
              </button>
              {getCategoryScore(categoryId)?.is_manual && (
                <button
                  onClick={handleResetToAutomatic}
                  disabled={savingCategoryScore}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Repasser en mode automatique"
                >
                  <RotateCcw className="h-4 w-4 text-white/80" />
                </button>
              )}
            </div>
          )}
          
          <div className="text-white/60 text-xs mt-1 flex items-center justify-center space-x-1">
            {getCategoryScore(categoryId)?.is_manual ? (
              <>
                <Edit className="h-3 w-3" />
                <span>Saisi manuellement</span>
              </>
            ) : (
              <>
                <Calculator className="h-3 w-3" />
                <span>Calculé automatiquement</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bree text-2xl text-blue-dark">Processes Overview</h2>
          <div className="text-sm text-gray">
            {processes.length} {processes.length === 1 ? 'process' : 'processes'}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {processes.map((process, index) => (
              <div key={process.id} className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <div 
                  className="p-6 bg-gradient-to-r from-primary to-secondary flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bree text-xl text-white">{process.name}</h3>
                  </div>
                  {assessmentId && scores[process.id] && (
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={async () => {
                          try {
                            setSavingScores(prev => ({ ...prev, [process.id]: true }));
                            const { data, error } = await supabase
                              .from('scores')
                              .update({ priority: !scores[process.id].priority })
                              .eq('id', scores[process.id].id)
                              .select()
                              .single();

                            if (error) throw error;
                            if (data) {
                              setScores(prev => ({
                                ...prev,
                                [process.id]: data
                              }));
                            }
                          } catch (err) {
                            console.error('Error updating priority:', err);
                            const errorMessage = handleDatabaseError(err);
                            setError('Failed to update priority status: ' + errorMessage);
                            
                            if (errorMessage.includes('Network connection') || errorMessage.includes('timed out')) {
                              setConnectionStatus('disconnected');
                            }
                          } finally {
                            setSavingScores(prev => ({ ...prev, [process.id]: false }));
                          }
                        }}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                          scores[process.id].priority
                            ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                        disabled={savingScores[process.id]}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {scores[process.id].priority ? 'Priority' : 'Mark as Priority'}
                        </span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/90">Score:</span>
                        <div className="relative">
                          <select
                            value={scores[process.id]?.score ?? 'N/A'}
                            onChange={(e) => {
                              handleScoreChange(process.id, e.target.value === 'N/A' ? null : Number(e.target.value));
                            }}
                            className="w-24 px-3 py-2 bg-white/10 border-2 border-white/30 rounded-lg text-white font-semibold focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none cursor-pointer hover:bg-white/20 transition-colors appearance-none pr-8"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            <option value="N/A" style={{backgroundColor: '#1f2937', color: 'white'}}>N/A</option>
                            <option value="1" style={{backgroundColor: '#1f2937', color: 'white'}}>1</option>
                            <option value="2" style={{backgroundColor: '#1f2937', color: 'white'}}>2</option>
                            <option value="3" style={{backgroundColor: '#1f2937', color: 'white'}}>3</option>
                            <option value="4" style={{backgroundColor: '#1f2937', color: 'white'}}>4</option>
                            <option value="5" style={{backgroundColor: '#1f2937', color: 'white'}}>5</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                        {savingScores[process.id] && (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-blue-dark mb-2">
                        <FileText className="h-5 w-5 flex-shrink-0" />
                        <span className="font-bree text-lg">Description</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {process.description.length > 0 ? (
                          process.description.map((desc, index) => (
                            <p key={index} className="text-gray-600 leading-relaxed mb-2 last:mb-0">{desc}</p>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">En cours de définition</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-blue-dark mb-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="font-bree text-lg">Key Questions</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {process.key_questions.length > 0 ? (
                          <ul className="space-y-2">
                            {process.key_questions.map((question, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue mt-0.5">•</span>
                                <span className="text-gray-600 leading-relaxed">{question}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">En cours de définition</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-100 pt-6">
                    <div className="flex items-center space-x-2 text-blue-dark mb-2">
                      <FileText className="h-5 w-5 flex-shrink-0" />
                      <span className="font-bree text-lg">Key Deliverables</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {process.key_artifacts.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {process.key_artifacts.map((artifact, index) => (
                            <li key={index} className="flex items-start space-x-2 bg-white p-3 rounded-lg">
                              <span className="text-blue mt-1">•</span>
                              <span className="text-gray-600">{artifact}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">En cours de définition</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-100 pt-6">
                    <div className="flex items-center space-x-2 text-blue-dark mb-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bree text-lg">Maturity Levels</span>
                        <button
                          onClick={toggleAllLevels}
                          className="text-sm text-gray-500 hover:text-blue transition-colors flex items-center space-x-1"
                        >
                          <span>{allExpanded ? 'Collapse all' : 'Expand all'}</span>
                          {allExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.keys(process.maturity_levels).some(key => process.maturity_levels[key] !== 'En cours de définition') ? (
                          Object.entries(process.maturity_levels)
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .map(([level, description]) => (
                              <div 
                                key={level} 
                                className={`p-4 rounded-lg border bg-white transition-colors ${
                                  scores[process.id]?.score === parseInt(level) 
                                   ? 'bg-white border-primary'
                                    : 'bg-gray-50 border-gray-100'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-bree text-blue-dark text-lg mb-2 flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <span>Level {level}</span>
                                        {scores[process.id]?.score !== null && scores[process.id]?.score === parseInt(level) && (
                                         <div className="text-white text-sm px-2 py-1 rounded bg-primary">Current</div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {getFirstSentence(description)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleLevel(process.id, level)}
                                  className={`mt-3 w-full flex items-center justify-center space-x-1 text-sm transition-colors py-1 border-t ${
                                    scores[process.id]?.score === parseInt(level)
                                      ? 'text-gray-600 hover:text-primary border-gray-100'
                                      : 'text-gray-500 hover:text-blue border-gray-100'
                                  }`}
                                >
                                  <span>{expandedLevels[`${process.id}-${level}`] ? 'Show less' : 'Show more'}</span>
                                  {expandedLevels[`${process.id}-${level}`] ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                                {expandedLevels[`${process.id}-${level}`] && (
                                  <div className="mt-2">
                                    <p className={`text-sm leading-relaxed ${
                                      scores[process.id]?.score === parseInt(level)
                                        ? 'text-gray-600'
                                        : 'text-gray-600'
                                    }`}>
                                      {description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-500 italic col-span-5">En cours de définition</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}