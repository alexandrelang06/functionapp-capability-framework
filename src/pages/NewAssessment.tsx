import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Banknote, Database, Calculator, Globe, Briefcase, Scale, FileText, DollarSign, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CHALLENGES = [
  'Réduction des coûts',
  'Efficacité opérationnelle',
  'Sécurité et conformité',
  'Modernisation technologique',
  'Alignement stratégique',
  'Optimisation de la gestion des ressources IT'
];

const FIELD_DESCRIPTIONS = {
  companyName: 'Nom légal complet de l\'entreprise',
  country: 'Pays de l\'entité principale auditée ou, en cas de décentralisation totale, pays du siège social',
  industry: 'Secteur d\'activité principal de l\'entreprise',
  companySize: 'Nombre total d\'employés dans l\'entreprise',
  exact_employees: 'Nombre exact d\'employés dans l\'entreprise (optionnel)',
  annualRevenue: 'Chiffre d\'affaires annuel de l\'entreprise',
  effective_revenue: 'Chiffre d\'affaires exact de l\'entreprise en euros (optionnel)',
  itDepartmentSize: 'Nombre total d\'employés IT (internes et externes)',
  exactItEmployees: 'Nombre exact d\'employés IT, incluant internes et externes (optionnel)',
  annualItCost: 'Coût IT annuel total incluant les coûts directs et indirects',
  effectiveItCost: 'Coût IT annuel exact en euros, incluant coûts directs et indirects (optionnel)',
  cioOrganization: 'Structure organisationnelle de la DSI',
  jobCode: 'Code de référence interne pour la mission',
  strategyContext: 'Description du contexte stratégique et business de l\'entreprise',
  technologyContext: 'Description de la stratégie et du contexte technologique',
  challenges: 'Principaux défis et objectifs de transformation',
  assessmentScope: 'Périmètre précis de l\'évaluation',
  bearingpointAdvisor: 'Nom du consultant BearingPoint en charge de la mission'
};
interface FormData {
  // Company Information
  companyName: string;
  industry: string;
  country: string;
  companySize: string;
  annualRevenue: string;
  exact_employees: string;
  effective_revenue: string;
  
  // IT Department Information
  itDepartmentSize: string;
  annualItCost: string;
  exactItEmployees: string;
  effectiveItCost: string;
  cioOrganization: string;
  
  // Context
  title: string;
  jobCode: string;
  strategyContext: string;
  technologyContext: string;
  challenges: string[];
  assessmentScope: string;
  bearingpointAdvisor: string;
}

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

const IT_DEPARTMENT_SIZES = [
  'Moins de 50',
  '50-100',
  '100-200',
  '200-500',
  '500-1000',
  '>1000',
  'Je ne sais pas'
];

const IT_COST_RANGES = [
  '<10M',
  '10-20',
  '20-50',
  '50-100',
  '100-200',
  '>200M',
  'Je ne sais pas'
];

const CIO_ORGANIZATIONS = [
  'Centralisée (+80% de la DSI dans une même entité)',
  'Décentralisée (DSI répartie entre plusieurs pays)'
];

export function NewAssessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    // Company Information
    companyName: '',
    industry: '',
    country: '',
    companySize: '',
    annualRevenue: '',
    exact_employees: '',
    effective_revenue: '',
    
    // IT Department Information
    itDepartmentSize: '',
    annualItCost: '',
    exactItEmployees: '',
    effectiveItCost: '',
    cioOrganization: '',
    
    // Context
    title: '',
    jobCode: '',
    strategyContext: '',
    technologyContext: '',
    challenges: [],
    assessmentScope: '',
    bearingpointAdvisor: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'challenges') {
      const selectedOptions = Array.from(e.target as HTMLSelectElement)
        .filter((option: HTMLOptionElement) => option.selected)
        .map((option: HTMLOptionElement) => option.value);
      setFormData(prev => ({
        ...prev,
        challenges: selectedOptions
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(
          formData.companyName &&
          formData.industry &&
          formData.country &&
          formData.companySize &&
          formData.annualRevenue
        );
      case 2:
        return Boolean(formData.cioOrganization);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== 3 || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      // Create company record
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          industry: formData.industry,
          country: formData.country,
          company_size: formData.companySize,
          annual_revenue: formData.annualRevenue,
          it_department_size: formData.itDepartmentSize || null,
          annual_it_cost: formData.annualItCost,
          exact_it_employees: parseInt(formData.exactItEmployees) || null,
          effective_it_cost: parseFloat(formData.effectiveItCost) || null,
          cio_organization: formData.cioOrganization,
          created_by: user.id
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create assessment record
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          company_id: company.id,
          title: formData.companyName,
          job_code: formData.jobCode,
          status: 'partial',
          is_open: true,
          completion_percentage: 0,
          strategy_context: formData.strategyContext,
          technology_context: formData.technologyContext,
          challenges: formData.challenges.length > 0 ? formData.challenges : null,
          assessment_scope: formData.assessmentScope,
          bearingpoint_advisor: formData.bearingpointAdvisor,
          created_by: user.id
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Navigate to the assessment view
      navigate(`/assessments/${assessment.id}`);
    } catch (err) {
      console.error('Error creating assessment:', err);
      setError('Failed to create assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-bree text-xl text-blue-dark">Company Information</h2>
              <p className="text-sm text-gray flex items-center space-x-2">
                <span className="text-red-500">*</span>
                <span>Required fields</span>
              </p>
            </div>
            
            <FormField
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              icon={<Building2 className="h-5 w-5 text-gray" />}
              placeholder="Enter company name"
              required
            />

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray font-din">
                <Globe className="h-5 w-5" />
                <div className="flex items-center space-x-1">
                  <span>Country</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.country}</p>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                required
              >
                <option value="">Select country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray font-din">
                <Briefcase className="h-5 w-5" />
                <div className="flex items-center space-x-1">
                  <span>Industry</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.industry}</p>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                required
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray font-din">
                <Users className="h-5 w-5" />
                <div className="flex items-center space-x-1">
                  <span>Company Size</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.companySize}</p>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                required
              >
                <option value="">Select company size</option>
                {COMPANY_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <FormField
              label="Exact Number of Employees"
              name="exact_employees"
              value={formData.exact_employees}
              onChange={handleInputChange}
              icon={<Users className="h-5 w-5 text-gray" />}
              placeholder="Enter exact number of employees"
              type="number"
              min="1"
            />

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray font-din">
                <Banknote className="h-5 w-5" />
                <div className="flex items-center space-x-1">
                  <span>Annual Revenue</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.annualRevenue}</p>
              <select
                name="annualRevenue"
                value={formData.annualRevenue}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                required
              >
                <option value="">Select annual revenue</option>
                {REVENUE_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <FormField
              label="Effective Revenue"
              name="effective_revenue"
              value={formData.effective_revenue}
              onChange={handleInputChange}
              icon={<DollarSign className="h-5 w-5 text-gray" />}
              placeholder="Enter effective revenue"
              type="number"
              min="1"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-bree text-xl text-blue-dark">IT Department Information</h2>
              <p className="text-sm text-gray flex items-center space-x-2">
                <span className="text-red-500">*</span>
                <span>Required fields</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray font-din">
                <Users className="h-5 w-5" />
                <span>IT Department Size</span>
              </label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.itDepartmentSize}</p>
              <select
                name="itDepartmentSize"
                value={formData.itDepartmentSize}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                required
              >
                <option value="">-- Select IT department size --</option>
                {IT_DEPARTMENT_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <FormField
              label="Exact Number of IT Employees"
              name="exactItEmployees"
              value={formData.exactItEmployees}
              onChange={handleInputChange}
              icon={<Users className="h-5 w-5 text-gray" />}
              placeholder="Enter exact number of IT employees"
              type="number"
              min="1"
            />

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray font-din">
                <Calculator className="h-5 w-5" />
                <span>Annual IT Cost</span>
              </label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.annualItCost}</p>
              <select
                name="annualItCost"
                value={formData.annualItCost}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                required
              >
                <option value="">-- Select annual IT cost --</option>
                {IT_COST_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <FormField
              label="Effective IT Cost"
              name="effectiveItCost"
              value={formData.effectiveItCost}
              onChange={handleInputChange}
              icon={<Calculator className="h-5 w-5 text-gray" />}
              placeholder="Enter effective IT cost"
              type="number"
              min="1"
            />

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray font-din">
                <Building2 className="h-5 w-5" />
                <div className="flex items-center space-x-1">
                  <span>CIO Office Structure</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.cioOrganization}</p>
              <select
                name="cioOrganization"
                value={formData.cioOrganization}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                required
              >
                <option value="">-- Select CIO office structure --</option>
                {CIO_ORGANIZATIONS.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-bree text-xl text-blue-dark">Context</h2>
              <p className="text-sm text-gray flex items-center space-x-2">
                <span className="text-red-500">*</span>
                <span>Required fields</span>
              </p>
            </div>
            
            <FormField
              label="Job Code"
              name="jobCode"
              value={formData.jobCode}
              onChange={handleInputChange}
              icon={<FileText className="h-5 w-5 text-gray" />}
              placeholder="Enter job code"
            />

            <div className="space-y-2">
              <label className="block text-gray font-din mb-2">Strategy and Business Context</label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.strategyContext}</p>
              <textarea
                name="strategyContext"
                value={formData.strategyContext}
                onChange={handleInputChange}
                placeholder="Describe the organization's strategy and business context..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray font-din mb-2">Technology Strategy and Context</label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.technologyContext}</p>
              <textarea
                name="technologyContext"
                value={formData.technologyContext}
                onChange={handleInputChange}
                placeholder="Describe the organization's technology strategy and context..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray font-din mb-2">Challenges</label>
              <p className="text-sm text-gray-light mb-3">{FIELD_DESCRIPTIONS.challenges}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHALLENGES.map(challenge => (
                  <label key={challenge} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="challenges"
                      value={challenge}
                      checked={formData.challenges.includes(challenge)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          challenges: e.target.checked
                            ? [...prev.challenges, value]
                            : prev.challenges.filter(c => c !== value)
                        }));
                      }}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-gray-700">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-gray font-din mb-2">Assessment Scope</label>
              <p className="text-sm text-gray-light mb-2">{FIELD_DESCRIPTIONS.assessmentScope}</p>
              <textarea
                name="assessmentScope"
                value={formData.assessmentScope}
                onChange={handleInputChange}
                placeholder="Define the scope of the assessment..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                rows={3}
              />
            </div>

            <FormField
              label="BearingPoint Advisor"
              name="bearingpointAdvisor"
              value={formData.bearingpointAdvisor}
              onChange={handleInputChange}
              icon={<User className="h-5 w-5 text-gray" />}
              placeholder="Enter advisor name"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-bree text-4xl text-blue-dark">New Assessment</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === currentStep
                      ? 'bg-primary text-white'
                      : step < currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray">Company Info</span>
            <span className="text-sm text-gray">IT Department</span>
            <span className="text-sm text-gray">Context</span>
          </div>
        </div>

        {renderStep()}

        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 text-blue hover:text-blue-dark transition-colors"
            >
              Back
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid(currentStep)}
              className={`
                ml-auto px-6 py-2 rounded-lg font-semibold
                ${isStepValid(currentStep)
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
                transition-colors
              `}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className={`
                ml-auto flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold
                ${isStepValid(currentStep) && !isSubmitting
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
                transition-colors
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  <span>Start Assessment</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  placeholder: string;
  description?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  required?: boolean;
}

function FormField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  description,
  type = 'text',
  min,
  max,
  step,
  required = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-gray font-din">
        <div className="flex items-center space-x-2">
        {icon}
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
        </div>
      </label>
      {(description || FIELD_DESCRIPTIONS[name]) && (
        <p className="text-sm text-gray-light mb-2">{description || FIELD_DESCRIPTIONS[name]}</p>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
      />
    </div>
  );
}