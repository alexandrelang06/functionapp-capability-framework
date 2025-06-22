import React from 'react';
import { HelpCircle, Target, BarChart3, ClipboardList, Settings, Lock, Download } from 'lucide-react';

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
            Learn how to use the IT Process Maturity Assessment Framework effectively
          </p>
        </header>

        <div className="grid gap-8">
          <Section
            icon={<Target className="h-6 w-6" />}
            title="What is the IT Process Maturity Assessment?"
            content={`
              The IT Process Maturity Assessment is a comprehensive framework designed to evaluate and improve your organization's IT processes. It helps you:
              
              • Assess the current maturity level of your IT processes
              • Identify areas for improvement
              • Track progress over time
              • Align IT processes with industry best practices
            `}
          />

          <Section
            icon={<BarChart3 className="h-6 w-6" />}
            title="How does the scoring system work?"
            content={`
              The framework uses a 5-level maturity scale:

              1. Initial/Ad-hoc: Processes are unorganized and undefined
              2. Repeatable: Basic processes are established
              3. Defined: Processes are documented and standardized
              4. Managed: Processes are measured and controlled
              5. Optimized: Focus on continuous improvement

              Each process is scored on this scale. Category and domain scores are calculated as averages with one decimal place.
            `}
          />

          <Section
            icon={<ClipboardList className="h-6 w-6" />}
            title="How to conduct an assessment?"
            content={`
              1. Create a new assessment from the "New Assessment" button
              2. Fill in the organization and IT department information
              3. Define the assessment scope and objectives
              4. Score each process in the framework
              5. Add notes and evidence for each score
              6. Review the results in the heatmap view
              7. Export or share the assessment report
            `}
          />

          <Section
            icon={<Settings className="h-6 w-6" />}
            title="What are the different framework components?"
            content={`
              The framework is organized hierarchically:

              • Domains: High-level areas of IT management
              • Categories: Groups of related processes within a domain
              • Processes: Specific IT activities to be assessed
              
              Each component is color-coded for easy navigation and visualization.
            `}
          />

          <Section
            icon={<Lock className="h-6 w-6" />}
            title="How are assessments managed?"
            content={`
              Assessments can be:

              • Open: Allowing updates and modifications
              • Closed: Locked for historical reference
              
              You can track multiple assessments over time to monitor improvement.
            `}
          />

          <Section
            icon={<Download className="h-6 w-6" />}
            title="Can I export assessment data?"
            content={`
              Yes, you can export:

              • Complete assessment reports
              • Maturity heatmaps as images
              • Detailed process scores and notes
              • Comparative analysis between assessments
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