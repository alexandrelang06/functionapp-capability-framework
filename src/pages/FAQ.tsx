import React from 'react';
import { HelpCircle, Target, BarChart3, ClipboardList, Settings, Lock, Download, Users, Building2, Calculator } from 'lucide-react';

export function FAQ() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue/10 rounded-full mb-6">
            <HelpCircle className="h-8 w-8 text-blue" />
          </div>
          <h1 className="font-bree text-4xl text-blue-dark mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Learn how to use the IT Capability Framework effectively for your organization's IT maturity assessment
          </p>
        </header>

        <div className="grid gap-8">
          <Section
            icon={<Target className="h-6 w-6" />}
            title="What is the IT Capability Framework?"
            content={`
              The IT Capability Framework is a comprehensive assessment tool designed to evaluate and improve your organization's IT processes across multiple domains. It helps you:
              
              • Assess the current maturity level of your IT capabilities
              • Identify areas for improvement and optimization
              • Track progress over time with detailed benchmarking
              • Align IT processes with industry best practices
              • Compare your organization against industry benchmarks
            `}
          />

          <Section
            icon={<BarChart3 className="h-6 w-6" />}
            title="How does the maturity scoring system work?"
            content={`
              The framework uses a 5-level maturity scale for each process:

              1. Initial/Ad-hoc: Processes are unorganized and undefined
              2. Repeatable: Basic processes are established and follow patterns
              3. Defined: Processes are documented and standardized
              4. Managed: Processes are measured, controlled and monitored
              5. Optimized: Focus on continuous improvement and innovation

              Scores are calculated automatically:
              • Process scores: Individual ratings from 1-5 or N/A
              • Category scores: Average of process scores (can be manually overridden)
              • Domain scores: Average of category scores
              • Global score: Overall average across all domains
            `}
          />

          <Section
            icon={<ClipboardList className="h-6 w-6" />}
            title="How to conduct a comprehensive assessment?"
            content={`
              Follow these steps for a complete assessment:

              1. Create a new assessment from the "New Assessment" button
              2. Fill in comprehensive organization information:
                 - Company details (name, industry, country, size, revenue)
                 - IT department information (size, budget, structure)
                 - Strategic and technology context
              3. Define assessment scope, objectives and constraints
              4. Score each process across all framework domains
              5. Add detailed notes and evidence for each score
              6. Mark priority processes for focused improvement
              7. Review results in the interactive heatmap view
              8. Export comprehensive reports for stakeholders
            `}
          />

          <Section
            icon={<Building2 className="h-6 w-6" />}
            title="What framework domains are covered?"
            content={`
              The framework covers 6 main domains organized in 3 levels:

              Strategic Level (Plan & Govern):
              • Plan Strategy: IT strategy alignment and portfolio management
              • Govern Technology: Risk, compliance, cybersecurity and data governance
              • Manage Architecture: Enterprise architecture and technology strategy

              Operational Level (Deliver & Operate):
              • Manage Demand: Business relationships and demand management
              • Deliver Solutions: Project delivery and solution engineering
              • Operate Solutions: Operations and cybersecurity operations
              • Support Users: Service management and user support

              Foundation Level (Steer Resources):
              • Steer Resources: Finance, HR, asset management and sourcing

              Each domain contains multiple categories with specific processes to assess.
            `}
          />

          <Section
            icon={<Calculator className="h-6 w-6" />}
            title="How are category and domain scores calculated?"
            content={`
              Scoring follows a hierarchical calculation:

              • Process Scores: Individual ratings (1-5 or N/A)
              • Category Scores: Automatic average of process scores within the category
              • Manual Override: Category scores can be manually set if needed
              • Domain Scores: Average of all category scores within the domain
              • Global Score: Overall average across all domains

              Key features:
              • N/A scores are excluded from calculations
              • Scores are rounded to one decimal place
              • Manual category scores override automatic calculations
              • Priority processes can be flagged for special attention
            `}
          />

          <Section
            icon={<Users className="h-6 w-6" />}
            title="Who can access and manage assessments?"
            content={`
              The platform supports different user roles:

              • Regular Users: Can create and manage their own assessments
              • Administrators: Can view and manage all assessments
              • Super Administrators: Full system access including user management

              Assessment Management:
              • Assessments can be marked as "Open" (editable) or "Closed" (read-only)
              • Multiple assessments can be tracked over time
              • Detailed benchmark data is available for qualified assessments
              • Mission leads and BearingPoint advisors can be assigned
            `}
          />

          <Section
            icon={<Settings className="h-6 w-6" />}
            title="Can the framework be customized?"
            content={`
              Yes, administrators can customize the framework:

              • Process Definitions: Edit descriptions, key questions, and deliverables
              • Maturity Levels: Customize maturity level descriptions for each process
              • Framework Structure: Add or modify domains, categories, and processes
              • Assessment Templates: Create standardized assessment templates

              All changes are automatically saved and applied across the platform.
            `}
          />

          <Section
            icon={<Lock className="h-6 w-6" />}
            title="How is data security and privacy handled?"
            content={`
              Data security is a top priority:

              • All data is stored securely in Supabase with encryption
              • Row-level security (RLS) ensures users only access their data
              • Authentication is required for all operations
              • Regular backups and data integrity checks
              • GDPR-compliant data handling practices
              • Audit trails for all assessment modifications
            `}
          />

          <Section
            icon={<Download className="h-6 w-6" />}
            title="What export and reporting options are available?"
            content={`
              Comprehensive reporting capabilities:

              • Complete assessment reports with all scores and notes
              • Interactive maturity heatmaps as high-resolution images
              • Detailed process scores and evidence documentation
              • Comparative analysis between multiple assessments
              • Benchmark reports comparing against industry standards
              • Executive summaries for stakeholder presentations
              • Raw data exports for further analysis

              All reports maintain professional formatting suitable for client delivery.
            `}
          />
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

function Section({ icon, title, content }: SectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue/10">
            <div className="text-blue">{icon}</div>
          </div>
          <div className="flex-1">
            <h2 className="font-bree text-2xl text-blue-dark mb-4">{title}</h2>
            <div className="text-gray text-lg leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}