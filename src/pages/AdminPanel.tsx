import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, Settings, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in: string;
}

interface DatabaseStats {
  assessments: number;
  companies: number;
  totalScores: number;
  avgCompletionRate: number;
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('user_emails')
        .select('*')
        .order('email');

      if (usersError) throw usersError;

      // Fetch database statistics
      const { data: assessments } = await supabase
        .from('assessments')
        .select('completion_percentage');

      const { data: companies } = await supabase
        .from('companies')
        .select('id');

      const { data: scores } = await supabase
        .from('scores')
        .select('id');

      const avgCompletion = assessments?.length 
        ? assessments.reduce((sum, a) => sum + (a.completion_percentage || 0), 0) / assessments.length 
        : 0;

      setUsers(usersData || []);
      setStats({
        assessments: assessments?.length || 0,
        companies: companies?.length || 0,
        totalScores: scores?.length || 0,
        avgCompletionRate: Math.round(avgCompletion)
      });

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(userId);

      // Delete user's assessments
      const { error: assessmentsError } = await supabase
        .from('assessments')
        .delete()
        .eq('created_by', userId);

      if (assessmentsError) throw assessmentsError;

      // Delete user's companies
      const { error: companiesError } = await supabase
        .from('companies')
        .delete()
        .eq('created_by', userId);

      if (companiesError) throw companiesError;

      // Delete user
      const { error: userError } = await supabase.auth.admin.deleteUser(userId);
      if (userError) throw userError;

      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          <p className="text-gray">Loading administrative data...</p>
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
            onClick={fetchData}
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-bree text-3xl text-blue-dark mb-2">Admin Panel</h1>
          <p className="text-gray">Manage users and monitor system statistics</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2 text-gray hover:text-blue transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh Data</span>
        </button>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Total Users"
            value={users.length}
            color="blue"
          />
          <StatCard
            icon={<Database className="h-6 w-6" />}
            title="Assessments"
            value={stats.assessments}
            color="green"
          />
          <StatCard
            icon={<Settings className="h-6 w-6" />}
            title="Companies"
            value={stats.companies}
            color="purple"
          />
          <StatCard
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Avg. Completion"
            value={`${stats.avgCompletionRate}%`}
            color="orange"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bree text-xl text-blue-dark">System Users</h2>
            <Shield className="h-6 w-6 text-blue" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-gray font-din">Email</th>
                <th className="px-6 py-3 text-left text-gray font-din">Created</th>
                <th className="px-6 py-3 text-left text-gray font-din">Last Sign In</th>
                <th className="px-6 py-3 text-left text-gray font-din">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-din">{user.email}</td>
                  <td className="px-6 py-4 font-din">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-din">
                    {user.last_sign_in 
                      ? new Date(user.last_sign_in).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteLoading === user.id}
                      className={`
                        flex items-center space-x-2 p-2 rounded-lg
                        ${deleteLoading === user.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                        }
                        transition-colors
                      `}
                      title="Delete User"
                    >
                      {deleteLoading === user.id ? (
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
  const colors = {
    blue: 'bg-blue/10 text-blue',
    green: 'bg-green-500/10 text-green-600',
    purple: 'bg-purple-500/10 text-purple-600',
    orange: 'bg-orange-500/10 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray font-din">{title}</p>
          <p className="font-bree text-2xl text-blue-dark">{value}</p>
        </div>
      </div>
    </div>
  );
}