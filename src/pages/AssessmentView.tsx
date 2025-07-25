import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Calendar, User, Globe, Landmark, DollarSign, Lock, Lock as LockOpen, Download, Printer, ZoomIn, ZoomOut, Maximize2, Edit, Save, X, FileText, AlertCircle, Database } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useFramework } from '../contexts/FrameworkContext';
import { useCategoryScores } from '../contexts/CategoryScoresContext';
import { ITCapabilityFramework } from '../components/ITCapabilityFramework';
import { calculateDomainScore, calculateGlobalScore } from '../lib/scoreUtils';
import { supabase } from '../lib/supabase';

// Import constants from NewAssessment
const COMPANY_SIZES = [
  '< 500',
  '500 - 2 000',
  '2 000 - 10 000',
  '10 000 - 50 000',
  '50 000 - 200 000',
  '> 200 000'
];

const REVENUE_RANGES = [
  '< 250M€',
  '250M€ - 500M€',
  '500M€ - 1Md€',
  '1Md€ - 10Bd€',
  '+10Bd€'
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
  'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

const INDUSTRIES = [
  'Automotive & Industrial Manufacturing',
  'Banking & Capital Markets',
  'Chemicals, Life Sciences & Resources',
  'Communications, Media & Entertainment',
  'Consumer Goods & Retail',
  'Government & Public Sector',
  'Insurance',
  'Professional services',
  'Software edition',
  'Utilities, Postal & Transportation'
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface AssessmentScore {
  process_id: string;
  score: number;
  notes?: string;
  priority?: boolean;
}

interface DomainScore {
  id: string;
  title: string;
  avgScore: number;
}

interface AssessmentData {
  id: string;
  company: {
    id: string;
    name: string;
    industry: string;
    country: string;
    company_size: string;
    annual_revenue: string;
    it_department_size: string;
    exact_it_employees: number | null;
    annual_it_cost: string;
    effective_it_cost: number | null;
    cio_organization: string;
    it_budget_percentage: number | null;
    detailed_benchmark_available: boolean;
  };
  title: string;
  job_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'complete' | 'partial';
  is_open: boolean;
  completion_percentage: number;
  scores: AssessmentScore[];
  mission_lead?: string;
  challenges?: string[];
  strategy_context?: string;
  technology_context?: string;
  assessment_scope?: string;
  bearingpoint_advisor?: string;
}

export function AssessmentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { frameworkData } = useFramework();
  const { categoryScores, setCategoryScores } = useCategoryScores();
  
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [globalMaturityScore, setGlobalMaturityScore] = useState<number>(0);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingScores, setSavingScores] = useState<Record<string, boolean>>({});
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [showDetailsSection, setShowDetailsSection] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [editableData, setEditableData] = useState({
    effectiveRevenue: '',
    exactEmployees: '',
    exactItEmployees: '',
    effectiveItCost: '',
    cioOrganization: '',
    itDepartmentSize: '',
    annualItCost: '',
    detailedBenchmarkAvailable: 'no',
    strategyContext: '',
    technologyContext: '',
    assessmentScope: '',
    challenges: [] as string[],
    bearingpointAdvisor: ''
  });

  // Calculate completion percentage
  const calculateCompletionPercentage = useCallback(async (assessmentScores: AssessmentScore[]) => {
    try {
      // Get total number of processes
      const { data: processes, error: processError } = await supabase
        .from('processes')
        .select('id');
      
      if (processError) throw processError;
      
      const totalProcesses = processes?.length || 0;
      if (totalProcesses === 0) return 0;
      
      // Count processes with scores > 0
      const scoredProcesses = assessmentScores.filter(score => score.score > 0).length;
      
      // Calculate percentage
      const percentage = Math.round((scoredProcesses / totalProcesses) * 100);
      
      return percentage;
    } catch (err) {
      console.error('Error calculating completion percentage:', err);
      return 0;
    }
  }, []);

  // Update completion percentage in database
  const updateCompletionPercentage = useCallback(async (assessmentId: string, percentage: number) => {
    try {
      const newStatus = percentage === 100 ? 'complete' : 'partial';
      
      const { error } = await supabase
        .from('assessments')
        .update({ 
          completion_percentage: percentage,
          status: newStatus
        })
        .eq('id', assessmentId);
      
      if (error) throw error;
      
      // Update local state
      setAssessment(prev => prev ? {
        ...prev,
        completion_percentage: percentage,
        status: newStatus
      } : null);
      
    } catch (err) {
      console.error('Error updating completion percentage:', err);
    }
  }, []);

  const handleSaveDetails = async () => {
    if (!assessment) return;
    
    try {
      setSavingDetails(true);
      setDetailsError(null);

      // Update company data
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          effective_revenue: editableData.effectiveRevenue ? parseFloat(editableData.effectiveRevenue) : null,
          exact_employees: editableData.exactEmployees ? parseInt(editableData.exactEmployees) : null,
          exact_it_employees: editableData.exactItEmployees ? parseInt(editableData.exactItEmployees) : null,
          effective_it_cost: editableData.effectiveItCost ? parseFloat(editableData.effectiveItCost) : null,
          cio_organization: editableData.cioOrganization,
          it_department_size: editableData.itDepartmentSize,
          annual_it_cost: editableData.annualItCost,
          detailed_benchmark_available: editableData.detailedBenchmarkAvailable === 'yes'
        })
        .eq('id', assessment.company.id);

      if (companyError) throw companyError;

      // Update assessment data
      const { error: assessmentError } = await supabase
        .from('assessments')
        .update({
          strategy_context: editableData.strategyContext,
          technology_context: editableData.technologyContext,
          assessment_scope: editableData.assessmentScope,
          challenges: editableData.challenges.length > 0 ? editableData.challenges : null,
          bearingpoint_advisor: editableData.bearingpointAdvisor
        })
        .eq('id', assessment.id);

      if (assessmentError) throw assessmentError;

      // Update local state
      setAssessment(prev => prev ? {
        ...prev,
        strategy_context: editableData.strategyContext,
        technology_context: editableData.technologyContext,
        assessment_scope: editableData.assessmentScope,
        challenges: editableData.challenges.length > 0 ? editableData.challenges : null,
        bearingpoint_advisor: editableData.bearingpointAdvisor,
        company: {
          ...prev.company,
          effective_revenue: editableData.effectiveRevenue ? parseFloat(editableData.effectiveRevenue) : null,
          exact_employees: editableData.exactEmployees ? parseInt(editableData.exactEmployees) : null,
          exact_it_employees: editableData.exactItEmployees ? parseInt(editableData.exactItEmployees) : null,
          effective_it_cost: editableData.effectiveItCost ? parseFloat(editableData.effectiveItCost) : null,
          cio_organization: editableData.cioOrganization,
          it_department_size: editableData.itDepartmentSize,
          annual_it_cost: editableData.annualItCost,
          detailed_benchmark_available: editableData.detailedBenchmarkAvailable === 'yes'
        }
      } : null);

      setIsEditingDetails(false);
    } catch (err) {
      console.error('Error saving details:', err);
      setDetailsError('Failed to save changes. Please try again.');
    } finally {
      setSavingDetails(false);
    }
  };

  const [editedHeader, setEditedHeader] = useState({
    company: {
      name: '',
      industry: '',
      country: '',
      company_size: '',
      annual_revenue: ''
    },
    assessment: {
      job_code: '',
      mission_lead: ''
    }
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    company: {
      it_department_size: '',
      exact_it_employees: null as number | null,
      annual_it_cost: '',
      effective_it_cost: null as number | null,
      cio_organization: '',
      it_budget_percentage: null as number | null,
      detailed_benchmark_available: false
    },
    assessment: {
      strategy_context: '',
      technology_context: '',
      assessment_scope: '',
      challenges: [] as string[],
      bearingpoint_advisor: ''
    },
    missionLead: ''
  });

  const handleToggleStatus = async () => {
    if (!assessment) return;
    
    try {
      setUpdatingStatus(true);
      
      const { error } = await supabase
        .from('assessments')
        .update({ 
          is_open: !assessment.is_open,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      if (error) throw error;

      // Update local state
      setAssessment(prev => prev ? {
        ...prev,
        is_open: !prev.is_open
      } : null);

      setShowStatusModal(false);
    } catch (err) {
      console.error('Error updating assessment status:', err);
      alert('Failed to update assessment status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    let companyData;
    let updatedAssessment;

    try {
      if (!assessment) return;

      // First update company
      const { data: updatedCompany, error: companyError } = await supabase
        .from('companies')
        .update({
          name: editedHeader.company.name,
          industry: editedHeader.company.industry,
          country: editedHeader.company.country,
          company_size: editedHeader.company.company_size,
          annual_revenue: editedHeader.company.annual_revenue
        })
        .eq('id', assessment.company.id)
        .select()
        .single();

      if (companyError) throw companyError;
      if (!updatedCompany) {
        throw new Error('Company update failed - no data returned');
      }
      companyData = updatedCompany;

      // Then update assessment
      const { data: updated, error: assessmentError } = await supabase
        .from('assessments')
        .update({
          job_code: editedHeader.assessment.job_code,
          mission_lead: editedHeader.assessment.mission_lead,
          title: updatedCompany.name
        })
        .eq('id', assessment.id)
        .select()
        .single();

      if (assessmentError) throw assessmentError;
      if (!updated) {
        throw new Error('Assessment update failed - no data returned');
      }
      updatedAssessment = updated;

      // Update local state
      setAssessment(prev => ({
        ...prev!,
        ...updated,
        company: companyData,
        job_code: editedHeader.assessment.job_code,
        mission_lead: editedHeader.assessment.mission_lead
      }));

      setIsEditingHeader(false);
      setSaveError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      console.error('Error saving changes:', errorMessage);
      setSaveError(errorMessage);
      
      // Revert form state if save failed
      if (assessment) {
        setEditedHeader({
          company: {
            name: assessment.company.name,
            industry: assessment.company.industry,
            country: assessment.company.country,
            company_size: assessment.company.company_size,
            annual_revenue: assessment.company.annual_revenue
          },
          assessment: {
            job_code: assessment.job_code || '',
            mission_lead: assessment.mission_lead || ''
          }
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditingHeader && assessment) {
      setEditedHeader({
        company: {
          name: assessment.company.name,
          industry: assessment.company.industry,
          country: assessment.company.country,
          company_size: assessment.company.company_size,
          annual_revenue: assessment.company.annual_revenue
        },
        assessment: {
          job_code: assessment.job_code || '',
          mission_lead: assessment.mission_lead || ''
        }
      });
    }
    setIsEditingHeader(!isEditingHeader);
    setSaving(false);
    setSaveError(null);
  };

  const fetchAssessment = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch assessment data with category scores
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          company:companies!inner(
            id,
            name,
            industry,
            country,
            company_size,
            annual_revenue,
            it_department_size,
            annual_it_cost,
            it_budget_percentage,
            detailed_benchmark_available,
            exact_it_employees,
            effective_it_cost,
            cio_organization
          ),
          scores(
            process_id,
            score,
            notes,
            priority
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      if (!assessmentData) {
        throw new Error('Assessment not found');
      }
      
      // Fetch category scores
      const { data: categoryScoresData, error: categoryScoresError } = await supabase
        .from('category_scores')
        .select('*')
        .eq('assessment_id', id);
        
      if (categoryScoresError) throw categoryScoresError;
      
      // Update the global category scores context
      setCategoryScores(categoryScoresData || []);
      
      // Calculate and update completion percentage
      if (assessmentData.scores && id) {
        const calculatedPercentage = await calculateCompletionPercentage(assessmentData.scores);
        setCompletionPercentage(calculatedPercentage);
        
        // Update database if percentage is different
        if (calculatedPercentage !== assessmentData.completion_percentage) {
          await updateCompletionPercentage(id, calculatedPercentage);
        }
      }
      
      // Update local state with the new completion percentage and category scores
      setAssessment({
        ...assessmentData,
        completion_percentage: completionPercentage
      });

    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Failed to load assessment data');
      if (err instanceof Error && err.message === 'Assessment not found') {
        navigate('/assessments');
      }
    } finally {
      setLoading(false);
    }
  }, [id, calculateCompletionPercentage, updateCompletionPercentage, setCategoryScores, navigate, completionPercentage]);

  // Update scores whenever assessment data changes
  useEffect(() => {
    if (!assessment) return;

    const scores = assessment.scores.map(s => ({
      processId: s.process_id,
      score: s.score
    }));

    const domainScoresData = frameworkData.map(domain => ({
        id: domain.id,
        title: domain.title,
        avgScore: calculateDomainScore(scores, domain, categoryScores)
    }));
    
    setDomainScores(domainScoresData);
    
    setGlobalMaturityScore(calculateGlobalScore(scores, frameworkData, categoryScores));
  }, [assessment, frameworkData, categoryScores]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(0.5, newScale), 2);
    });
  };

  const handleFullscreen = () => {
    const element = document.getElementById('framework-container');
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExport = async () => {
    const element = document.getElementById('framework-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `assessment-${id}-framework.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error exporting framework:', err);
    }
  };

  const formatScore = (score: number): string => {
    return Math.round(score).toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          <p className="text-gray">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || 'Assessment not found'}</p>
      </div>
    );
  }

  const radarData = {
    labels: domainScores.map(domain => domain.title),
    datasets: [{
      label: 'Domain Maturity Scores',
      data: domainScores.map(domain => domain.avgScore),
      backgroundColor: 'rgba(43, 213, 255, 0.2)',
      borderColor: 'rgba(43, 213, 255, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(43, 213, 255, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(43, 213, 255, 1)',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            family: "'DIN', sans-serif"
          }
        },
        pointLabels: {
          font: {
            size: 14,
            family: "'Bree Serif', serif",
            weight: '500'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#00799a',
        titleFont: {
          size: 14,
          family: "'Bree Serif', serif",
          weight: '500'
        },
        bodyColor: '#484f52',
        bodyFont: {
          size: 12,
          family: "'DIN', sans-serif"
        },
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items: any[]) => items[0].label,
          label: (item: any) => `Maturity Score: ${item.raw.toFixed(1)}`
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="space-y-4 mb-2">
              {isEditingHeader ? (
                <input
                  type="text"
                  value={editedHeader.company.name}
                  onChange={(e) => setEditedHeader(prev => ({
                    ...prev,
                    company: { ...prev.company, name: e.target.value }
                  }))}
                  className="font-bree text-3xl text-blue-dark w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                  placeholder="Company Name"
                />
              ) : (
                <h1 className="font-bree text-3xl text-blue-dark">{assessment.company.name}</h1>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray" />
                {isEditingHeader ? (
                  <input
                    type="text"
                    value={editedHeader.assessment.job_code}
                    onChange={(e) => setEditedHeader(prev => ({
                      ...prev,
                      assessment: { ...prev.assessment, job_code: e.target.value }
                    }))}
                    className="text-sm px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                    placeholder="Job Code"
                  />
                ) : (
                  <span className="text-sm">{assessment.job_code || 'No Job Code'}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {assessment.is_open && (
              <button
                onClick={() => handleEditToggle()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isEditingHeader 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'text-blue hover:text-blue-dark'
                }`}
              >
                {isEditingHeader ? (
                  <>
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-5 w-5" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            )}
            {isEditingHeader && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  saving
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2fd0fd] text-white hover:bg-[#2fd0fd]/90'
                }`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}
            <button 
              onClick={() => window.print()}
              className="text-gray hover:text-blue transition-colors"
              title="Imprimer l'évaluation"
            >
              <Printer className="h-6 w-6" />
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{saveError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-gray" />
              <span className="text-gray">Company Size:</span>
              {isEditingHeader ? (
                <select
                  value={editedHeader.company.company_size}
                  onChange={(e) => setEditedHeader(prev => ({
                    ...prev,
                    company: { ...prev.company, company_size: e.target.value }
                  }))}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                >
                  <option value="">Select company size</option>
                  {COMPANY_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              ) : (
                <span>{assessment.company.company_size}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray" />
              <span className="text-gray">Country:</span>
              {isEditingHeader ? (
                <select
                  value={editedHeader.company.country}
                  onChange={(e) => setEditedHeader(prev => ({
                    ...prev,
                    company: { ...prev.company, country: e.target.value }
                  }))}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              ) : (
                <span>{assessment.company.country}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Landmark className="h-5 w-5 text-gray" />
              <span className="text-gray">Industry:</span>
              {isEditingHeader ? (
                <select
                  value={editedHeader.company.industry}
                  onChange={(e) => setEditedHeader(prev => ({
                    ...prev,
                    company: { ...prev.company, industry: e.target.value }
                  }))}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              ) : (
                <span>{assessment.company.industry}</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray" />
              <span className="text-gray">Annual Revenue:</span>
              {isEditingHeader ? (
                <select
                  value={editedHeader.company.annual_revenue}
                  onChange={(e) => setEditedHeader(prev => ({
                    ...prev,
                    company: { ...prev.company, annual_revenue: e.target.value }
                  }))}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                >
                  <option value="">Select annual revenue</option>
                  {REVENUE_RANGES.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              ) : (
                <span>{assessment.company.annual_revenue}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray" />
              <span className="text-gray">Last Modified:</span>
              <span>{new Date(assessment.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray" />
              <span className="text-gray">Mission Lead:</span>
              {isEditingHeader ? (
                <input
                  type="text"
                  value={editedHeader.assessment.mission_lead}
                  onChange={(e) => setEditedHeader(prev => ({
                    ...prev,
                    assessment: { ...prev.assessment, mission_lead: e.target.value }
                  }))}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                  placeholder="Mission Lead"
                />
              ) : (
                <span>{assessment.mission_lead || 'Not specified'}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray" />
              <span className="font-din">Detailed Benchmark:</span>
              {assessment.company?.detailed_benchmark_available !== null ? (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  assessment.company?.detailed_benchmark_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {assessment.company?.detailed_benchmark_available ? 'Available' : 'Not Available'}
                </span>
              ) : (
                <span className="text-gray-500 text-xs">N/A</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {assessment.is_open ? (
                <>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center space-x-2 text-blue hover:text-blue-dark transition-colors"
                  >
                    <LockOpen className="h-5 w-5" />
                    <span>Open for Updates (Click to Close)</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center space-x-2 text-gray hover:text-blue transition-colors"
                  >
                    <Lock className="h-5 w-5" />
                    <span>Closed (Click to Reopen)</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray">Completion:</span>
              <div className="flex-1">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#2fd0fd] transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <span>{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div 
          className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors hidden"
          onClick={() => setShowDetailsSection(!showDetailsSection)}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bree text-xl text-blue-dark">Additional Details</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray">
                {showDetailsSection ? 'Hide details' : 'Show details'}
              </span>
              {showDetailsSection ? (
                <ChevronUp className="h-5 w-5 text-gray" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray" />
              )}
            </div>
          </div>
        </div>

        {showDetailsSection && (
          <div className="p-6 space-y-6 hidden">
            {/* IT Department Details */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-bree text-lg text-blue-dark mb-4">IT Department Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">IT Department Size</label>
                  {isEditingDetails ? (
                    <select
                      value={editedDetails.company.it_department_size || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        company: { ...prev.company, it_department_size: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                    >
                      <option value="">Select IT department size</option>
                      <option value="Less than 50">Less than 50</option>
                      <option value="50-100">50-100</option>
                      <option value="100-200">100-200</option>
                      <option value="200-500">200-500</option>
                      <option value="500-1000">500-1000</option>
                      <option value=">1000">&gt;1000</option>
                      <option value="I don't know">I don't know</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{assessment.company.it_department_size || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Exact IT Employees</label>
                  {isEditingDetails ? (
                    <input
                      type="number"
                      min="1"
                      value={editedDetails.company.exact_it_employees || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        company: { ...prev.company, exact_it_employees: parseInt(e.target.value) || null }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      placeholder="Enter exact number of IT employees"
                    />
                  ) : (
                    <p className="text-gray-600">{assessment.company.exact_it_employees || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Annual IT Cost</label>
                  {isEditingDetails ? (
                    <select
                      value={editedDetails.company.annual_it_cost || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        company: { ...prev.company, annual_it_cost: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                    >
                      <option value="">Select annual IT cost</option>
                      <option value="<10M">&lt;10M</option>
                      <option value="10-20">10-20</option>
                      <option value="20-50">20-50</option>
                      <option value="50-100">50-100</option>
                      <option value="100-200">100-200</option>
                      <option value=">200M">&gt;200M</option>
                      <option value="I don't know">I don't know</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{assessment.company.annual_it_cost || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Effective IT Cost (€)</label>
                  {isEditingDetails ? (
                    <input
                      type="number"
                      min="1"
                      value={editedDetails.company.effective_it_cost || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        company: { ...prev.company, effective_it_cost: parseFloat(e.target.value) || null }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      placeholder="Enter effective IT cost"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {assessment.company.effective_it_cost 
                        ? `€${assessment.company.effective_it_cost.toLocaleString()}` 
                        : 'Not specified'
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">CIO Organization</label>
                  {isEditingDetails ? (
                    <select
                      value={editedDetails.company.cio_organization || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        company: { ...prev.company, cio_organization: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                    >
                      <option value="">Select CIO organization</option>
                      <option value="Centralized (80%+ of the IT department in a single entity)">
                        Centralized (80%+ of the IT department in a single entity)
                      </option>
                      <option value="Decentralized (IT department spread across multiple countries)">
                        Decentralized (IT department spread across multiple countries)
                      </option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{assessment.company.cio_organization || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment Context */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-bree text-lg text-blue-dark mb-4">Assessment Context</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Strategy Context</label>
                  {isEditingDetails ? (
                    <textarea
                      value={editedDetails.assessment.strategy_context || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        assessment: { ...prev.assessment, strategy_context: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      rows={3}
                      placeholder="Describe the strategy context..."
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {assessment?.strategy_context || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Technology Context</label>
                  {isEditingDetails ? (
                    <textarea
                      value={editedDetails.assessment.technology_context || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        assessment: { ...prev.assessment, technology_context: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      rows={3}
                      placeholder="Describe the technology context..."
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {assessment?.technology_context || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Assessment Scope</label>
                  {isEditingDetails ? (
                    <textarea
                      value={editedDetails.assessment.assessment_scope || ''}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        assessment: { ...prev.assessment, assessment_scope: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                      rows={3}
                      placeholder="Define the assessment scope..."
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {assessment?.assessment_scope || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Challenges</label>
                  {isEditingDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {['Cost reduction', 'Operational efficiency', 'Security and compliance', 'Technological modernization', 'Strategic alignment', 'Optimization of IT resource management'].map(challenge => (
                        <label key={challenge} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editedDetails.assessment.challenges?.includes(challenge) || false}
                            onChange={(e) => {
                              const currentChallenges = editedDetails.assessment.challenges || [];
                              const newChallenges = e.target.checked
                                ? [...currentChallenges, challenge]
                                : currentChallenges.filter(c => c !== challenge);
                              setEditedDetails(prev => ({
                                ...prev,
                                assessment: { ...prev.assessment, challenges: newChallenges }
                              }));
                            }}
                            className="w-4 h-4 text-blue border-gray-300 rounded focus:ring-blue"
                          />
                          <span className="text-sm text-gray-700">{challenge}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {assessment?.challenges && assessment.challenges.length > 0 ? (
                        assessment.challenges.map((challenge, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue/10 text-blue rounded-full text-sm"
                          >
                            {challenge}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-600">No challenges specified</p>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-gray-900 hidden">{assessment.company.exact_it_employees || 'Not specified'}</p>

                <div className="space-y-2 hidden">
                  <label className="block text-sm font-medium text-gray-700">BearingPoint Advisor</label>
                  <span className="text-gray-600">{assessment.bearingpoint_advisor || 'Not specified'}</span>
                </div>

                <div className="space-y-2 hidden">
                  <label className="block text-sm font-medium text-gray-700">Mission Lead</label>
                  {isEditingDetails ? (
                    <input
                      type="text"
                      value={editedDetails.missionLead}
                      onChange={(e) => setEditedDetails(prev => ({ ...prev, missionLead: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter mission lead name"
                    />
                  ) : (
                    <p className="text-gray-600">{assessment?.mission_lead || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Detailed Benchmark Available</label>
                  {isEditingDetails ? (
                    <select
                      value={editedDetails.company.detailed_benchmark_available ? 'yes' : 'no'}
                      onChange={(e) => setEditedDetails(prev => ({
                        ...prev,
                        company: { ...prev.company, detailed_benchmark_available: e.target.value === 'yes' }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">
                      {assessment.company?.detailed_benchmark_available ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              {isEditingDetails ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditingDetails(false);
                      // Reset edited details to current assessment data
                      setEditedDetails({
                        company: {
                          it_department_size: assessment.company.it_department_size,
                          exact_it_employees: assessment.company.exact_it_employees,
                          annual_it_cost: assessment.company.annual_it_cost,
                          effective_it_cost: assessment.company.effective_it_cost,
                          cio_organization: assessment.company.cio_organization,
                          it_budget_percentage: assessment.company.it_budget_percentage,
                          detailed_benchmark_available: assessment.company.detailed_benchmark_available
                        },
                        assessment: {
                          strategy_context: assessment.strategy_context,
                          technology_context: assessment.technology_context,
                          assessment_scope: assessment.assessment_scope,
                          challenges: assessment.challenges,
                          bearingpoint_advisor: assessment.bearingpoint_advisor
                        },
                        missionLead: assessment.mission_lead || ''
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDetails}
                    disabled={savingDetails}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                      ${savingDetails
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#2fd0fd] text-white hover:bg-[#2fd0fd]/90'
                      }
                    `}
                  >
                    {savingDetails ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingDetails(true);
                    // Initialize edited details with current data
                    setEditedDetails({
                      company: {
                        it_department_size: assessment.company.it_department_size,
                        exact_it_employees: assessment.company.exact_it_employees,
                        annual_it_cost: assessment.company.annual_it_cost,
                        effective_it_cost: assessment.company.effective_it_cost,
                        cio_organization: assessment.company.cio_organization,
                        it_budget_percentage: assessment.company.it_budget_percentage,
                        detailed_benchmark_available: assessment.company.detailed_benchmark_available
                      },
                      assessment: {
                        strategy_context: assessment.strategy_context,
                        technology_context: assessment.technology_context,
                        assessment_scope: assessment.assessment_scope,
                        challenges: assessment.challenges,
                        bearingpoint_advisor: assessment.bearingpoint_advisor
                      },
                      missionLead: assessment.mission_lead || ''
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-blue hover:text-blue-dark transition-colors"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assessment Details - Left Column */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-bree text-2xl text-blue-dark mb-6">Global Maturity Score</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-dark">
                    {formatScore(globalMaturityScore)}
                  </div>
                  <div className="text-gray mt-2">Scale: 0-5</div>
                  <div className="text-sm text-blue mt-1">
                    {globalMaturityScore >= 4 ? 'Excellent' :
                     globalMaturityScore >= 3 ? 'Good' :
                     globalMaturityScore >= 2 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="16"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#2cd5ff"
                  strokeWidth="16"
                  strokeDasharray={`${(globalMaturityScore / 5) * 552} 552`}
                />
              </svg>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center space-x-2 hidden">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600 font-medium">Not Available</span>
            </div>
          </div>
        </div>

        {/* Domain Maturity - Right Column */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-bree text-2xl text-blue-dark mb-4">Domain Maturity Overview</h2>
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-full h-full">
              <Radar 
                data={radarData}
                options={radarOptions}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 text-gray hover:text-[#2bd5ff] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 text-gray hover:text-[#2bd5ff] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 text-gray hover:text-[#2bd5ff] transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-gray hover:text-[#2bd5ff] transition-colors"
              title="Export as PNG"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div 
          id="framework-container"
          className="overflow-x-auto"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <ITCapabilityFramework 
            scores={assessment.scores?.map(s => ({
              process_id: s.process_id,
              score: s.score || 0,
              notes: s.notes || '',
              priority: s.priority || false
            })) || []}
            readOnly={true}
            showHeatmap={true}
            assessmentId={assessment.id}
            isOpen={assessment.is_open}
            categoryScores={categoryScores}
          />
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bree text-xl text-blue-dark mb-4">
              {assessment.is_open ? 'Close Assessment?' : 'Reopen Assessment?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {assessment.is_open 
                ? 'Closing the assessment will prevent further updates to scores and metadata. This action can be reversed.'
                : 'Reopening the assessment will allow updates to scores and metadata.'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={updatingStatus}
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-2
                  ${updatingStatus
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : assessment.is_open
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-[#2bd5ff] text-white hover:bg-[#2bd5ff]/90'
                  }
                  transition-colors
                `}
              >
                {updatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>{assessment.is_open ? 'Close Assessment' : 'Reopen Assessment'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}