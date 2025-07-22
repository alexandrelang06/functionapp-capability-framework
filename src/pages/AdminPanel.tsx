import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, Settings, AlertTriangle, RefreshCw, Trash2, BarChart3, Filter, TrendingUp, Building2, Globe, Calendar } from 'lucide-react';
import { Bar, Line, Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { supabase } from '../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

interface ProcessScore {
  process_id: string;
  process_name: string;
  category_id: string;
  category_title: string;
  domain_id: string;
  domain_title: string;
  avg_score: number;
  count: number;
}

interface DatabaseStats {
  assessments: number;
  companies: number;
  scores: number;
  avgCompletionRate: number;
}

interface BenchmarkData {
  id: string;
  company_name: string;
  industry: string;
  country: string;
  company_size: string;
  annual_revenue: string;
  completion_percentage: number;
  global_score: number;
  created_at: string;
  domain_scores: {
    domain_id: string;
    domain_title: string;
    avg_score: number;
  }[];
}

interface Assessment {
  id: string;
  title: string;
  completion_percentage: number;
  created_at: string;
  company: {
    name: string;
  };
}

export function AdminPanel() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteAssessmentLoading, setDeleteAssessmentLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  
  // Benchmark filters
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [revenueFilter, setRevenueFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'company' | 'score' | 'completion' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Chart states
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar' | 'doughnut'>('bar');
  const [chartLevel, setChartLevel] = useState<'process' | 'category' | 'domain'>('domain');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [processScores, setProcessScores] = useState<ProcessScore[]>([]);
  const [chartFilters, setChartFilters] = useState({
    industry: 'all',
    country: 'all',
    minScore: 0,
    maxScore: 5
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    generateChartData();
  }, [chartType, chartLevel, processScores, chartFilters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch benchmark data with domain scores
      const { data: benchmarkAssessments, error: benchmarkError } = await supabase
        .from('assessments')
        .select(`
          id,
          completion_percentage,
          created_at,
          company:companies!inner (
            name,
            industry,
            country,
            company_size,
            annual_revenue
          ),
          scores(process_id, score)
        `)
        .order('created_at', { ascending: false });

      if (benchmarkError) throw benchmarkError;

      // Get domains and processes for score calculation
      const { data: domains } = await supabase
        .from('domains')
        .select(`
          id,
          title,
          categories(
            id,
            processes(id)
          )
        `)
        .order('order_index');

      // Calculate benchmark data
      const benchmark: BenchmarkData[] = benchmarkAssessments?.map(assessment => {
        const scores = assessment.scores || [];
        const totalProcesses = domains?.reduce((total, domain) => 
          total + domain.categories.reduce((catTotal, category) => 
            catTotal + category.processes.length, 0), 0) || 1;
        
        // Calculate global score
        const validScores = scores.filter(s => s.score > 0);
        const globalScore = validScores.length > 0 
          ? validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length 
          : 0;

        // Calculate domain scores
        const domainScores = domains?.map(domain => {
          const domainProcesses = domain.categories.flatMap(cat => cat.processes);
          const domainScoreValues = scores
            .filter(s => domainProcesses.some(p => p.id === s.process_id) && s.score > 0)
            .map(s => s.score);
          
          const avgScore = domainScoreValues.length > 0
            ? domainScoreValues.reduce((sum, score) => sum + score, 0) / domainScoreValues.length
            : 0;

          return {
            domain_id: domain.id,
            domain_title: domain.title,
            avg_score: avgScore
          };
        }) || [];

        return {
          id: assessment.id,
          company_name: assessment.company.name,
          industry: assessment.company.industry,
          country: assessment.company.country,
          company_size: assessment.company.company_size,
          annual_revenue: assessment.company.annual_revenue,
          completion_percentage: assessment.completion_percentage,
          global_score: globalScore,
          created_at: assessment.created_at,
          domain_scores: domainScores
        };
      }) || [];

      setBenchmarkData(benchmark);

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

      setStats({
        assessments: assessments?.length || 0,
        companies: companies?.length || 0,
        scores: scores?.length || 0,
        avgCompletionRate: Math.round(avgCompletion)
      });

      // Fetch assessments for management
      const { data: assessmentsData } = await supabase
        .from('assessments')
        .select(`
          id,
          title,
          completion_percentage,
          created_at,
          company:companies(name)
        `)
        .order('created_at', { ascending: false });

      setAssessments(assessmentsData || []);

      // Fetch process scores for charts
      await fetchProcessScores();

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessScores = async () => {
    try {
      const { data: scoresData, error } = await supabase
        .from('scores')
        .select(`
          process_id,
          score,
          assessment:assessments!inner(
            id,
            company:companies!inner(
              industry,
              country
            )
          ),
          process:processes!inner(
            name,
            category:categories!inner(
              id,
              title,
              domain:domains!inner(
                id,
                title
              )
            )
          )
        `)
        .gt('score', 0);

      if (error) throw error;

      // Group scores by process/category/domain
      const processMap = new Map<string, ProcessScore>();
      
      scoresData?.forEach(score => {
        const key = score.process_id;
        if (!processMap.has(key)) {
          processMap.set(key, {
            process_id: score.process_id,
            process_name: score.process.name,
            category_id: score.process.category.id,
            category_title: score.process.category.title,
            domain_id: score.process.category.domain.id,
            domain_title: score.process.category.domain.title,
            avg_score: 0,
            count: 0
          });
        }
        
        const processScore = processMap.get(key)!;
        processScore.avg_score = (processScore.avg_score * processScore.count + score.score) / (processScore.count + 1);
        processScore.count += 1;
      });

      setProcessScores(Array.from(processMap.values()));
    } catch (err) {
      console.error('Error fetching process scores:', err);
    }
  };

  const generateChartData = () => {
    if (!processScores.length) return;

    let filteredData = processScores.filter(item => {
      return item.avg_score >= chartFilters.minScore && item.avg_score <= chartFilters.maxScore;
    });

    let labels: string[] = [];
    let data: number[] = [];
    let backgroundColors: string[] = [];

    if (chartLevel === 'domain') {
      const domainMap = new Map<string, { total: number; count: number }>();
      filteredData.forEach(item => {
        if (!domainMap.has(item.domain_title)) {
          domainMap.set(item.domain_title, { total: 0, count: 0 });
        }
        const domain = domainMap.get(item.domain_title)!;
        domain.total += item.avg_score * item.count;
        domain.count += item.count;
      });

      labels = Array.from(domainMap.keys());
      data = labels.map(label => {
        const domain = domainMap.get(label)!;
        return domain.count > 0 ? domain.total / domain.count : 0;
      });
    } else if (chartLevel === 'category') {
      const categoryMap = new Map<string, { total: number; count: number }>();
      filteredData.forEach(item => {
        if (!categoryMap.has(item.category_title)) {
          categoryMap.set(item.category_title, { total: 0, count: 0 });
        }
        const category = categoryMap.get(item.category_title)!;
        category.total += item.avg_score * item.count;
        category.count += item.count;
      });

      labels = Array.from(categoryMap.keys());
      data = labels.map(label => {
        const category = categoryMap.get(label)!;
        return category.count > 0 ? category.total / category.count : 0;
      });
    } else {
      // Process level
      filteredData = filteredData.slice(0, 20); // Limit to top 20 processes
      labels = filteredData.map(item => item.process_name);
      data = filteredData.map(item => item.avg_score);
    }

    // Generate colors based on score
    backgroundColors = data.map(score => {
      if (score >= 4) return 'rgba(34, 197, 94, 0.8)'; // Green
      if (score >= 3) return 'rgba(59, 130, 246, 0.8)'; // Blue
      if (score >= 2) return 'rgba(245, 158, 11, 0.8)'; // Yellow
      return 'rgba(239, 68, 68, 0.8)'; // Red
    });

    const chartDataset = {
      labels,
      datasets: [{
        label: `Score moyen par ${chartLevel === 'domain' ? 'domaine' : chartLevel === 'category' ? 'catégorie' : 'processus'}`,
        data,
        backgroundColor: chartType === 'doughnut' ? backgroundColors : 'rgba(59, 130, 246, 0.8)',
        borderColor: chartType === 'doughnut' ? backgroundColors.map(color => color.replace('0.8', '1')) : 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: chartType === 'radar'
      }]
    };

    setChartData(chartDataset);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      setDeleteAssessmentLoading(assessmentId);
      setError(null);

      // Delete scores first
      const { error: scoresError } = await supabase
        .from('scores')
        .delete()
        .eq('assessment_id', assessmentId);

      if (scoresError) throw scoresError;

      // Delete assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId);

      if (assessmentError) throw assessmentError;

      setAssessments(prev => prev.filter(assessment => assessment.id !== assessmentId));
      setShowDeleteConfirm(null);
      setDeleteSuccess(assessmentId);
      
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
    } finally {
      setDeleteAssessmentLoading(null);
    }
  };

  // Filter and sort benchmark data
  const filteredBenchmarkData = benchmarkData
    .filter(item => {
      return (
        (industryFilter === 'all' || item.industry === industryFilter) &&
        (countryFilter === 'all' || item.country === countryFilter) &&
        (sizeFilter === 'all' || item.company_size === sizeFilter) &&
        (revenueFilter === 'all' || item.annual_revenue === revenueFilter)
      );
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'company':
          return multiplier * a.company_name.localeCompare(b.company_name);
        case 'score':
          return multiplier * (a.global_score - b.global_score);
        case 'completion':
          return multiplier * (a.completion_percentage - b.completion_percentage);
        case 'date':
          return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        default:
          return 0;
      }
    });

  // Get unique values for filters
  const industries = Array.from(new Set(benchmarkData.map(item => item.industry).filter(Boolean)));
  const countries = Array.from(new Set(benchmarkData.map(item => item.country).filter(Boolean)));
  const companySizes = Array.from(new Set(benchmarkData.map(item => item.company_size).filter(Boolean)));
  const revenues = Array.from(new Set(benchmarkData.map(item => item.annual_revenue).filter(Boolean)));

  // Calculate benchmark statistics
  const benchmarkStats = {
    avgGlobalScore: filteredBenchmarkData.length > 0 
      ? filteredBenchmarkData.reduce((sum, item) => sum + item.global_score, 0) / filteredBenchmarkData.length 
      : 0,
    avgCompletion: filteredBenchmarkData.length > 0
      ? filteredBenchmarkData.reduce((sum, item) => sum + item.completion_percentage, 0) / filteredBenchmarkData.length
      : 0,
    topPerformer: filteredBenchmarkData.length > 0
      ? filteredBenchmarkData.reduce((prev, current) => 
          prev.global_score > current.global_score ? prev : current)
      : null
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
            icon={<Database className="h-6 w-6" />}
            title="Évaluations"
            value={stats.assessments}
            color="blue"
          />
          <StatCard
            icon={<Building2 className="h-6 w-6" />}
            title="Entreprises"
            value={stats.companies}
            color="green"
          />
          <StatCard
            icon={<Settings className="h-6 w-6" />}
            title="Scores"
            value={stats.scores}
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

      {/* Benchmark Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bree text-xl text-blue-dark">Benchmark des Évaluations</h2>
            <BarChart3 className="h-6 w-6 text-blue" />
          </div>
        </div>

        {/* Benchmark Statistics */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bree text-blue-dark">
                {benchmarkStats.avgGlobalScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Score Global Moyen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bree text-blue-dark">
                {benchmarkStats.avgCompletion.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Complétion Moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bree text-blue-dark">
                {benchmarkStats.topPerformer?.company_name || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Meilleure Performance</div>
              {benchmarkStats.topPerformer && (
                <div className="text-xs text-blue">
                  Score: {benchmarkStats.topPerformer.global_score.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filtres</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
            >
              <option value="all">Tous les secteurs</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
            >
              <option value="all">Tous les pays</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
            >
              <option value="all">Toutes les tailles</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            
            <select
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
            >
              <option value="all">Tous les CA</option>
              {revenues.map(revenue => (
                <option key={revenue} value={revenue}>{revenue}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-sm text-gray-600">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue focus:border-blue outline-none text-sm"
            >
              <option value="score">Score Global</option>
              <option value="completion">Complétion</option>
              <option value="company">Entreprise</option>
              <option value="date">Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Benchmark Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-gray font-din">Entreprise</th>
                <th className="px-6 py-3 text-left text-gray font-din">Secteur</th>
                <th className="px-6 py-3 text-left text-gray font-din">Pays</th>
                <th className="px-6 py-3 text-left text-gray font-din">Taille</th>
                <th className="px-6 py-3 text-left text-gray font-din">CA</th>
                <th className="px-6 py-3 text-left text-gray font-din">Score Global</th>
                <th className="px-6 py-3 text-left text-gray font-din">Complétion</th>
                <th className="px-6 py-3 text-left text-gray font-din">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBenchmarkData.map(item => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-din font-medium">{item.company_name}</td>
                  <td className="px-6 py-4 font-din">{item.industry}</td>
                  <td className="px-6 py-4 font-din">{item.country}</td>
                  <td className="px-6 py-4 font-din">{item.company_size}</td>
                  <td className="px-6 py-4 font-din">{item.annual_revenue}</td>
                  <td className="px-6 py-4 font-din">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        item.global_score >= 4 ? 'text-green-600' :
                        item.global_score >= 3 ? 'text-blue-600' :
                        item.global_score >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {item.global_score.toFixed(1)}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.global_score >= 4 ? 'bg-green-500' :
                            item.global_score >= 3 ? 'bg-blue-500' :
                            item.global_score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(item.global_score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-din">
                    <div className="flex items-center space-x-2">
                      <span>{item.completion_percentage}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue transition-all duration-300"
                          style={{ width: `${item.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-din text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBenchmarkData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée de benchmark disponible avec les filtres sélectionnés
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bree text-xl text-blue-dark">Évaluations</h2>
            <Database className="h-6 w-6 text-blue" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-gray font-din">Titre</th>
                <th className="px-6 py-3 text-left text-gray font-din">Entreprise</th>
                <th className="px-6 py-3 text-left text-gray font-din">Complétion</th>
                <th className="px-6 py-3 text-left text-gray font-din">Date</th>
                <th className="px-6 py-3 text-left text-gray font-din">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map(assessment => (
                <tr key={assessment.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-din">{assessment.title}</td>
                  <td className="px-6 py-4 font-din">{assessment.company?.name}</td>
                  <td className="px-6 py-4 font-din">
                    <div className="flex items-center space-x-2">
                      <span>{assessment.completion_percentage}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue transition-all duration-300"
                          style={{ width: `${assessment.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-din">
                    {new Date(assessment.created_at).toLocaleDateString()}
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
                      title="Supprimer l'évaluation"
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
          
          {assessments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune évaluation trouvée
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bree text-xl text-blue-dark">Analyse des Scores</h2>
            <BarChart3 className="h-6 w-6 text-blue" />
          </div>
        </div>

        {/* Chart Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de graphique</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
              >
                <option value="bar">Barres</option>
                <option value="line">Lignes</option>
                <option value="radar">Radar</option>
                <option value="doughnut">Camembert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'analyse</label>
              <select
                value={chartLevel}
                onChange={(e) => setChartLevel(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
              >
                <option value="domain">Domaines</option>
                <option value="category">Macro-processus</option>
                <option value="process">Processus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score minimum</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={chartFilters.minScore}
                onChange={(e) => setChartFilters(prev => ({ ...prev, minScore: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score maximum</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={chartFilters.maxScore}
                onChange={(e) => setChartFilters(prev => ({ ...prev, maxScore: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Données analysées: {processScores.length} processus</span>
            <span>•</span>
            <span>Niveau: {chartLevel === 'domain' ? 'Domaines' : chartLevel === 'category' ? 'Macro-processus' : 'Processus'}</span>
            <span>•</span>
            <span>Type: {chartType === 'bar' ? 'Barres' : chartType === 'line' ? 'Lignes' : chartType === 'radar' ? 'Radar' : 'Camembert'}</span>
          </div>
        </div>

        {/* Chart Display */}
        <div className="p-6">
          {chartData ? (
            <div className="h-96 flex items-center justify-center">
              {chartType === 'bar' && <Bar data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Score: ${context.parsed.y.toFixed(1)}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                  }
                }
              }} />}
              
              {chartType === 'line' && <Line data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Score: ${context.parsed.y.toFixed(1)}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                  }
                }
              }} />}
              
              {chartType === 'radar' && <Radar data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                  }
                }
              }} />}
              
              {chartType === 'doughnut' && <Doughnut data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'right',
                    labels: {
                      generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels?.map((label, index) => ({
                          text: `${label}: ${data.datasets[0].data[index].toFixed(1)}`,
                          fillStyle: data.datasets[0].backgroundColor[index],
                          strokeStyle: data.datasets[0].borderColor[index],
                          lineWidth: 2,
                          index
                        })) || [];
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.parsed.toFixed(1)}`
                    }
                  }
                }
              }} />}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chargement des données du graphique...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bree text-lg text-blue-dark mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray mb-6">
              Êtes-vous sûr de vouloir supprimer cette évaluation ? Cette action est irréversible.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteAssessment(showDeleteConfirm)}
                disabled={deleteAssessmentLoading === showDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteAssessmentLoading === showDeleteConfirm ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {deleteSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Évaluation supprimée avec succès
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