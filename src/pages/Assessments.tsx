import React, { useState, useEffect } from 'react';
import { Search, Calendar, Building2, User, Lock as LockOpen, Lock, Download, Eye, Edit, ChevronUp, ChevronDown, Globe, Landmark, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Assessment {
  id: string;
  company: {
    name: string;
    industry: string;
    country: string;
    company_size: string;
    annual_revenue: string;
  };
  title: string;
  created_by: string;
  created_at: string;
  status: 'complete' | 'partial';
  is_open: boolean;
  completion_percentage: number;
  avg_score: number;
  author?: {
    email: string;
  };
}

export function Assessments() {
  const { isAdmin } = useUser();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionDetails, setDeletionDetails] = useState<{
    success: boolean;
    details: string[];
  } | null>(null);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'complete' | 'partial'>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [companySizeFilter, setCompanySizeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  
  const [sortField, setSortField] = useState<'company' | 'createdBy' | 'lastModified' | 'completion' | 'country' | 'industry' | 'revenue'>('company');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const formatScore = (score: number): string => {
    return Math.round(score).toString();
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      setDeleteError(null);
      
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          id,
          title,
          status,
          is_open,
          completion_percentage,
          created_at,
          created_by,
          company:companies!company_id (
            name,
            industry,
            country,
            company_size,
            annual_revenue
          ),
          author:user_emails!created_by(email),
          scores(process_id, score)
        `)
        .order('created_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;

      const { data: processes } = await supabase.from('processes').select('id');
      const totalProcesses = processes?.length || 0;

      // Update completion percentage for each assessment
      const updatedAssessments = assessmentsData?.map(assessment => {
        const scoredProcesses = assessment.scores.filter(s => s.score > 0).length;
        const completionPercentage = Math.round((scoredProcesses / totalProcesses) * 100);

        // Update assessment in database
        supabase
          .from('assessments')
          .update({ 
            completion_percentage: completionPercentage,
            status: completionPercentage === 100 ? 'complete' : 'partial'
          })
          .eq('id', assessment.id);

        return {
          ...assessment,
          completion_percentage: completionPercentage
        };
      });

      setAssessments(updatedAssessments || []);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!isAdmin) return;
    
    setAssessmentToDelete(assessmentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!assessmentToDelete) return;
    
    // Reset state
    setDeletionDetails(null);
    setDeleteError(null);
    let success = false;
    const details: string[] = [];

    try {
      setDeleteLoading(assessmentToDelete);
      
      // Get assessment and company info
      const { data: assessment, error: fetchError } = await supabase
        .from('assessments')
        .select(`
          id, 
          company:companies!inner (id)
        `)
        .eq('id', assessmentToDelete)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!assessment) {
        throw new Error('Évaluation non trouvée');
      }

      details.push(`Évaluation trouvée avec l'ID ${assessment.id}`);
      details.push(`Entreprise associée: ${assessment.company.id}`);

      // Finally delete the assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentToDelete);

      if (assessmentError) {
        throw assessmentError;
      }

      details.push('Évaluation supprimée avec succès');
      details.push('Les scores associés ont été supprimés automatiquement');

      // Verify deletion
      const { data: checkAssessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('id', assessmentToDelete)
        .maybeSingle();

      if (checkAssessment === null) {
        details.push('Vérification: L\'évaluation n\'existe plus dans la base de données');
        
        // Check if company was deleted
        const { data: checkCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('id', assessment.company.id)
          .maybeSingle();
          
        if (checkCompany === null) {
          details.push('L\'entreprise associée a également été supprimée');
        }
      }

      // Only update UI state if everything succeeded
      setAssessments(prev => prev.filter(a => a.id !== assessmentToDelete));
      setDeletionDetails({
        success: true,
        details
      });
      success = true;

    } catch (err) {
      console.error('Error deleting assessment:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete assessment');
      setDeletionDetails({
        success: false, 
        details: [
          ...details,
          `Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
          'Certaines données peuvent avoir été partiellement supprimées'
        ]
      });
    } finally {
      setDeleteLoading(null); 
      if (!success) {
        // Refresh data to ensure UI is in sync with database
        fetchAssessments();
      }
    }
  };

  // Get unique values for filters
  const countries = Array.from(new Set(assessments.map(a => a.company?.country).filter(Boolean)));
  const companySizes = Array.from(new Set(assessments.map(a => a.company?.company_size).filter(Boolean)));

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAssessments = assessments
    .filter(assessment => {
      const matchesSearch = 
        assessment.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.author?.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCompletion = 
        completionFilter === 'all' || 
        (completionFilter === 'complete' && assessment.status === 'complete') ||
        (completionFilter === 'partial' && assessment.status === 'partial');
      
      const matchesAccess = 
        accessFilter === 'all' || 
        (accessFilter === 'open' && assessment.is_open) || 
        (accessFilter === 'closed' && !assessment.is_open);
      
      const matchesCompanySize =
        companySizeFilter === 'all' ||
        assessment.company?.company_size === companySizeFilter;
      
      const matchesCountry =
        countryFilter === 'all' ||
        assessment.company?.country === countryFilter;
      
      return matchesSearch && matchesCompletion && matchesAccess && matchesCompanySize && matchesCountry;
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'company':
          return multiplier * (a.company?.name || '').localeCompare(b.company?.name || '');
        case 'createdBy':
          return multiplier * (a.author?.email || '').localeCompare(b.author?.email || '');
        case 'lastModified':
          return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        case 'completion':
          return multiplier * (a.completion_percentage - b.completion_percentage);
        case 'country':
          return multiplier * (a.company?.country || '').localeCompare(b.company?.country || '');
        case 'industry':
          return multiplier * (a.company?.industry || '').localeCompare(b.company?.industry || '');
        case 'revenue':
          return multiplier * (a.company?.annual_revenue || '').localeCompare(b.company?.annual_revenue || '');
        default:
          return 0;
      }
    });

  const totalAssessments = filteredAssessments.length;
  const currentYearAssessments = filteredAssessments.filter(assessment => 
    new Date(assessment.created_at).getFullYear() === new Date().getFullYear()
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          <p className="text-gray">Loading assessments data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchAssessments}
            className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bree text-3xl text-blue-dark">Assessments</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <p className="text-gray text-sm">Total Assessments</p>
            <p className="font-bree text-2xl text-blue-dark">{totalAssessments}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <p className="text-gray text-sm">This Year</p>
            <p className="font-bree text-2xl text-blue-dark">{currentYearAssessments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray h-5 w-5" />
              <input
                type="text"
                placeholder="Search by company or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
              />
            </div>
            </div>
          </div>

          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as 'all' | 'complete' | 'partial')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
          >
            <option value="all">All Completion</option>
            <option value="complete">Complete</option>
            <option value="partial">Partial</option>
          </select>

          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value as 'all' | 'open' | 'closed')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
          >
            <option value="all">All Access</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={companySizeFilter}
            onChange={(e) => setCompanySizeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
          >
            <option value="all">All Company Sizes</option>
            {companySizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
          <div style={{ transform: 'rotateX(180deg)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-gray font-din">Assessment Details</th>
                <th 
                  className="px-4 py-3 text-left text-gray font-din cursor-pointer hover:text-blue-dark"
                  onClick={() => handleSort('completion')}
                >
                  Completion {sortField === 'completion' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray font-din cursor-pointer hover:text-blue-dark"
                  onClick={() => handleSort('company')}
                >
                  Company {sortField === 'company' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray font-din cursor-pointer hover:text-blue-dark"
                  onClick={() => handleSort('createdBy')}
                >
                  Created By {sortField === 'createdBy' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray font-din cursor-pointer hover:text-blue-dark"
                  onClick={() => handleSort('lastModified')}
                >
                  Last Modified {sortField === 'lastModified' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray font-din cursor-pointer hover:text-blue-dark"
                  onClick={() => handleSort('country')}
                >
                  Country {sortField === 'country' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray font-din cursor-pointer hover:text-blue-dark"
                  onClick={() => handleSort('industry')}
                >
                  Industry {sortField === 'industry' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </th>
                <th 
                  className="px-4 py-3 text-left text-gray font-din cursor-pointer hover:text-blue-dark"
                  onClick={() => handleSort('revenue')}
                >
                  Annual Revenue {sortField === 'revenue' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </th>
                <th className="px-4 py-3 text-left text-gray font-din">Access</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map(assessment => (
                <tr
                  key={assessment.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/assessments/${assessment.id}`}
                        className="px-3 py-1.5 text-white text-sm font-medium rounded-lg hover:opacity-80 transition-colors"
                        style={{ backgroundColor: '#2ed3fe' }}
                      >
                        See details
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteAssessment(assessment.id)}
                          disabled={deleteLoading === assessment.id}
                          className={`
                            flex items-center justify-center p-2 rounded-full h-8 w-8
                            ${deleteLoading === assessment.id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-50 text-red-500 hover:text-red-700 transition-colors'
                            }
                          `}
                          title="Delete Assessment"
                        >
                          {deleteLoading === assessment.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${assessment.completion_percentage}%` }}
                          />
                        </div>
                        <span className="font-din text-sm">{assessment.completion_percentage}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2 min-w-[40px]">
                      <div className="w-5 h-5 flex-shrink-0">
                        <Building2 className="h-5 w-5 text-blue" />
                      </div>
                      <span className="font-din">{assessment.company?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2 min-w-[40px]">
                      <div className="w-5 h-5 flex-shrink-0">
                        <User className="h-5 w-5 text-gray" />
                      </div>
                      <span className="font-din">{assessment.author?.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-din">
                    <div className="flex items-center space-x-2 min-w-[40px]">
                      <div className="w-5 h-5 flex-shrink-0">
                        <Calendar className="h-5 w-5 text-gray" />
                      </div>
                      <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2 min-w-[40px]">
                      <div className="w-5 h-5 flex-shrink-0">
                        <Globe className="h-5 w-5 text-gray" />
                      </div>
                      <span className="font-din">{assessment.company?.country}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2 min-w-[40px]">
                      <div className="w-5 h-5 flex-shrink-0">
                        <Landmark className="h-5 w-5 text-gray" />
                      </div>
                      <span className="font-din">{assessment.company?.industry}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2 min-w-[40px]">
                      <div className="w-5 h-5 flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-gray" />
                      </div>
                      <span className="font-din">{assessment.company?.annual_revenue}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {assessment.is_open ? (
                      <div className="flex items-center space-x-2 text-blue min-w-[40px]">
                        <div className="w-5 h-5 flex-shrink-0">
                          <LockOpen className="h-5 w-5 text-blue" />
                        </div>
                        <span className="font-din">Open</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray min-w-[40px]">
                        <div className="w-5 h-5 flex-shrink-0">
                          <Lock className="h-5 w-5 text-gray" />
                        </div>
                        <span className="font-din">Closed</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-bree text-lg">Delete Assessment</h3>
            </div>
            <div className="flex-1">
              {deletionDetails && (
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAssessmentToDelete(null);
                    setDeletionDetails(null);
                  }}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              )}
            </div>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                {deleteError}
              </div>
            )}

            {deletionDetails ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  deletionDetails.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <h4 className="font-bold mb-2">
                    {deletionDetails.success ? 'Deletion Successful' : 'Deletion Failed'}
                  </h4>
                  <div className="space-y-1 text-sm">
                    {deletionDetails.details.map((detail, index) => (
                      <p key={index} className="flex items-center space-x-2">
                        <span>•</span>
                        <span>{detail}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    setShowDeleteModal(false);
                    setAssessmentToDelete(null);
                    setDeletionDetails(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this assessment? This action cannot be undone and will also delete all associated scores and data.
                </p>
            
                <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAssessmentToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading === assessmentToDelete}
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-2 min-w-[120px] justify-center
                  ${deleteLoading === assessmentToDelete
                    ? 'bg-red-100 text-red-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                  }
                  transition-colors
                `}
              >
                {deleteLoading === assessmentToDelete ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-300 border-t-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Assessment</span>
                  </>
                )}
              </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}