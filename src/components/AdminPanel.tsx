import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, Settings, AlertTriangle, RefreshCw, Trash2, Building2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in: string | null;
}

interface DatabaseStats {
  assessments: number;
  companies: number;
  scores: number;
  avgCompletionRate: number;
}

interface Assessment {
  id: string;
  title: string;
  company: {
    name: string;
    id: string;
  };
  created_at: string;
  completion_percentage: number;
  status: string;
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteAssessmentLoading, setDeleteAssessmentLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch database statistics
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*');

      const { data: companies } = await supabase
        .from('companies')
        .select('*');

      const { data: scores } = await supabase
        .from('scores')
        .select('*');

      // Calculate average completion rate
      const completionRates = assessments?.map(a => a.completion_percentage || 0) || [];
      const avgCompletion = completionRates.length > 0 
        ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length 
        : 0;

      setStats({
        assessments: assessments?.length || 0,
        companies: companies?.length || 0,
        scores: scores?.length || 0,
        avgCompletionRate: Math.round(avgCompletion)
      });

      // Fetch assessments with company info
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          id,
          title,
          created_at,
          completion_percentage,
          status,
          company:companies!inner (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;
      setAssessments(assessmentsData || []);

      setStats({
        assessments: assessments?.length || 0,
        companies: companies?.length || 0,
        scores: scores?.length || 0,
        avgCompletionRate: Math.round(avgCompletion)
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleteLoading(userId);
      setError(null);

      const { error } = await supabase
        .from('user_emails')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      setDeleteAssessmentLoading(assessmentId);
      setError(null);

      // Get assessment info
      const assessment = assessments.find(a => a.id === assessmentId);
      if (!assessment) throw new Error('Évaluation non trouvée');

      // Delete scores first
      const { error: scoresError } = await supabase
        .from('scores')
        .delete()
        .eq('assessment_id', assessmentId);

      if (scoresError) throw scoresError;

      // Delete category scores
      const { error: categoryScoresError } = await supabase
        .from('category_scores')
        .delete()
        .eq('assessment_id', assessmentId);

      if (categoryScoresError) throw categoryScoresError;

      // Delete the assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId);

      if (assessmentError) throw assessmentError;

      // Delete the company
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', assessment.company.id);

      if (companyError) throw companyError;

      // Update local state
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      setShowDeleteConfirm(null);
      setDeleteSuccess(`L'évaluation "${assessment.title}" et l'entreprise "${assessment.company.name}" ont été supprimées avec succès.`);
      
      // Refresh stats
      fetchData();

    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleteAssessmentLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-bree text-3xl text-blue-dark mb-2">Panneau d'Administration</h1>
          <p className="text-gray">Gérer les évaluations et surveiller les statistiques du système</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            title="Évaluations"
            value={assessments.length}
            color="blue"
          />
          <StatCard
            icon={<Building2 className="h-6 w-6" />}
            title="Entreprises"
            value={stats.assessments}
            color="green"
          />
          <StatCard
            icon={<Database className="h-6 w-6" />}
            title="Scores"
            value={stats.companies}
            color="purple"
          />
          <StatCard
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Complétion Moy."
            value={`${stats.avgCompletionRate}%`}
            color="orange"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bree text-xl text-blue-dark">Évaluations</h2>
            <FileText className="h-6 w-6 text-blue" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-gray font-din">Titre</th>
                <th className="px-6 py-3 text-left text-gray font-din">Entreprise</th>
                <th className="px-6 py-3 text-left text-gray font-din">Créé le</th>
                <th className="px-6 py-3 text-left text-gray font-din">Complétion</th>
                <th className="px-6 py-3 text-left text-gray font-din">Statut</th>
                <th className="px-6 py-3 text-left text-gray font-din">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map(assessment => (
                <tr key={assessment.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-din">{assessment.title}</td>
                  <td className="px-6 py-4 font-din">{assessment.company.name}</td>
                  <td className="px-6 py-4 font-din">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-din">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue transition-all duration-300"
                          style={{ width: `${assessment.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{assessment.completion_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-din">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assessment.status === 'complete' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assessment.status === 'complete' ? 'Terminé' : 'En cours'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setShowDeleteConfirm(assessment.id)}
                      disabled={deleteAssessmentLoading === assessment.id}
                      className={`
                        flex items-center space-x-2 p-2 rounded-lg
                        ${deleteAssessmentLoading === assessment.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                        }
                        transition-colors
                      `}
                      title="Supprimer l'évaluation et l'entreprise"
                    >
                      {deleteAssessmentLoading === assessment.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-bree text-lg">Confirmer la suppression</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette évaluation ? Cette action supprimera également :
            </p>
            
            <ul className="text-sm text-gray-600 mb-6 space-y-1 ml-4">
              <li>• Tous les scores associés</li>
              <li>• Tous les scores de macro-processus</li>
              <li>• L'évaluation complète</li>
              <li>• L'entreprise associée</li>
            </ul>
            
            <p className="text-red-600 text-sm font-medium mb-6">
              Cette action est irréversible !
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteAssessment(showDeleteConfirm)}
                disabled={deleteAssessmentLoading === showDeleteConfirm}
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-2 min-w-[120px] justify-center
                  ${deleteAssessmentLoading === showDeleteConfirm
                    ? 'bg-red-100 text-red-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                  }
                  transition-colors
                `}
              >
                {deleteAssessmentLoading === showDeleteConfirm ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-300 border-t-white"></div>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {deleteSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{deleteSuccess}</p>
            </div>
            <button
              onClick={() => setDeleteSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg max-w-md">
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

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray font-din text-sm">{title}</p>
          <p className="font-bree text-2xl text-blue-dark mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}