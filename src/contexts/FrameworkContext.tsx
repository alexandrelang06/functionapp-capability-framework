import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Process {
  id: string;
  name: string;
  subProcesses?: string[];
  subProcessDescriptions?: Record<string, string>;
}

export interface Category {
  id: string;
  title: string;
  processes: Process[];
}

export interface Domain {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  color?: {
    header: string;
    background: string;
    process: string;
  };
}

interface FrameworkContextType {
  frameworkData: Domain[];
  setFrameworkData: (data: Domain[]) => void;
  lastSaved: Date | null;
  setLastSaved: (date: Date) => void;
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [frameworkData, setFrameworkData] = useState<Domain[]>([
    // Niveau Haut
    {
      id: 'plan-strategy',
      title: 'Plan strategy',
      description: 'Strategic planning and alignment processes',
      color: {
        header: '#f3f4f6',
        background: '#eff6ff',
        process: '#00799a',
      },
      categories: [
        {
          id: 'it-strategy',
          title: 'IT STRATEGY',
          processes: [
            {
              id: 'align-it-strategy-with-business-objectives',
              name: 'Align IT Strategy with business objectives',
              subProcesses: []
            },
            {
              id: 'define-and-execute-it-strategy',
              name: 'Define and execute IT Strategy',
              subProcesses: []
            }
          ]
        },
        {
          id: 'portfolio-management',
          title: 'PORTFOLIO MANAGEMENT',
          processes: [
            {
              id: 'evaluate-and-prioritize-investments',
              name: 'Evaluate and prioritize investments',
              subProcesses: []
            },
            {
              id: 'monitor-and-realign-portfolio',
              name: 'Monitor and realign portfolio',
              subProcesses: []
            },
            {
              id: 'monitor-capability-performance',
              name: 'Monitor capability performance',
              subProcesses: []
            }
          ]
        }
      ]
    },
    {
      id: 'govern-technology',
      title: 'Govern technology',
      description: 'Technology governance and risk management processes',
      color: {
        header: '#f3f4f6',
        background: '#eff6ff',
        process: '#00799a',
      },
      categories: [
        {
          id: 'cybersecurity-governance',
          title: 'CYBERSECURITY GOVERNANCE',
          processes: [
            {
              id: 'define-and-implement-cyber-risk',
              name: 'Define and implement cyber risk',
              subProcesses: []
            },
            {
              id: 'define-cybersecurity-policies',
              name: 'Define cybersecurity policies',
              subProcesses: []
            },
            {
              id: 'manage-cybersecurity-supply-chain-risk',
              name: 'Manage cybersecurity supply chain risk',
              subProcesses: []
            },
            {
              id: 'oversee-cybersecurity-performance',
              name: 'Oversee cybersecurity performance',
              subProcesses: []
            }
          ]
        },
        {
          id: 'it-risk-compliance',
          title: 'IT-RISK AND COMPLIANCE',
          processes: [
            {
              id: 'maintain-compliance-register-and-regulation-surveillance',
              name: 'Maintain a compliance register and regulation surveillance',
              subProcesses: []
            },
            {
              id: 'define-manage-it-and-compliance-risks',
              name: 'Define & Manage IT and compliance risks',
              subProcesses: []
            },
            {
              id: 'setup-control-system-for-it',
              name: 'Setup control system for IT',
              subProcesses: []
            },
            {
              id: 'ensure-sustainability-and-ethics-in-it',
              name: 'Ensure sustainability and ethics in IT',
              subProcesses: []
            }
          ]
        },
        {
          id: 'data-governance',
          title: 'DATA GOVERNANCE',
          processes: [
            {
              id: 'establish-and-maintain-data-catalog',
              name: 'Establish and maintain data catalog',
              subProcesses: []
            },
            {
              id: 'ensure-data-quality-and-integrity',
              name: 'Ensure data quality and integrity',
              subProcesses: []
            },
            {
              id: 'ensure-data-compliance-classification-and-risk-management',
              name: 'Ensure data compliance, classification and risk management',
              subProcesses: []
            }
          ]
        }
      ]
    },
    {
      id: 'manage-architecture',
      title: 'Manage architecture',
      description: 'Enterprise and technology architecture management',
      color: {
        header: '#f3f4f6',
        background: '#eff6ff',
        process: '#00799a',
      },
      categories: [
        {
          id: 'enterprise-architecture',
          title: 'ENTERPRISE ARCHITECTURE',
          processes: [
            {
              id: 'define-architecture-vision',
              name: 'Define architecture vision',
              subProcesses: []
            },
            {
              id: 'govern-architecture',
              name: 'Govern architecture',
              subProcesses: []
            },
            {
              id: 'transform-architecture',
              name: 'Transform architecture',
              subProcesses: []
            },
            {
              id: 'analyse-architecture',
              name: 'Analyse architecture',
              subProcesses: []
            }
          ]
        },
        {
          id: 'technology-strategy',
          title: 'TECHNOLOGY STRATEGY',
          processes: [
            {
              id: 'define-technology-strategy',
              name: 'Define technology strategy',
              subProcesses: []
            },
            {
              id: 'govern-technology',
              name: 'Govern technology',
              subProcesses: []
            },
            {
              id: 'manage-technology-risk',
              name: 'Manage technology risk',
              subProcesses: []
            },
            {
              id: 'foster-technology-innovation',
              name: 'Foster technology innovation',
              subProcesses: []
            }
          ]
        }
      ]
    },
    // Niveau Milieu
    {
      id: 'manage-demand',
      title: 'Manage demand',
      description: 'Demand management and business relationship processes',
      color: {
        header: '#dfe0ef',
        background: '#dfe0ef',
        process: '#9395c7',
      },
      categories: [
        {
          id: 'business-relationship',
          title: 'BUSINESS RELATIONSHIP',
          processes: [
            {
              id: 'maintain-relationship-and-communication',
              name: 'Maintain relationship and communication',
              subProcesses: []
            },
            {
              id: 'ensure-transparency-on-service-performance',
              name: 'Ensure transparency on service performance',
              subProcesses: []
            },
            {
              id: 'capture-and-integrate-continuous-feedback',
              name: 'Capture and integrate continuous feedback',
              subProcesses: []
            }
          ]
        },
        {
          id: 'demand-management',
          title: 'DEMAND MANAGEMENT',
          processes: [
            {
              id: 'gather-and-filter-demand',
              name: 'Gather and filter demand',
              subProcesses: []
            },
            {
              id: 'qualify-feasibility-and-compliance',
              name: 'Qualify feasibility and compliance',
              subProcesses: []
            },
            {
              id: 'manage-demand-and-supply-capacity',
              name: 'Manage demand and supply capacity',
              subProcesses: []
            }
          ]
        }
      ]
    },
    {
      id: 'deliver-solutions',
      title: 'Deliver solutions',
      description: 'Solution delivery and engineering processes',
      color: {
        header: '#dfe0ef',
        background: '#dfe0ef',
        process: '#9395c7',
      },
      categories: [
        {
          id: 'projects-programs-delivery',
          title: 'PROJECTS & PROGRAMS DELIVERY',
          processes: [
            {
              id: 'scope-projects-and-programs',
              name: 'Scope projects and programs',
              subProcesses: []
            },
            {
              id: 'plan-and-coordinate-delivery-roadmap',
              name: 'Plan and coordinate delivery roadmap',
              subProcesses: []
            },
            {
              id: 'engage-and-align-stakeholders',
              name: 'Engage and align stakeholders',
              subProcesses: []
            },
            {
              id: 'monitor-progress-and-quality',
              name: 'Monitor progress and quality',
              subProcesses: []
            },
            {
              id: 'create-and-maintain-it-documentation',
              name: 'Create and maintain IT documentation',
              subProcesses: []
            },
            {
              id: 'ensure-security-by-design-principles',
              name: 'Ensure security-by-design principles',
              subProcesses: []
            }
          ]
        },
        {
          id: 'solutions-engineering',
          title: 'SOLUTIONS ENGINEERING',
          processes: [
            {
              id: 'manage-govern-it-solutions-lifecycle',
              name: 'Manage & govern IT solutions lifecycle',
              subProcesses: []
            },
            {
              id: 'align-with-business-requirements',
              name: 'Align with business requirements',
              subProcesses: []
            },
            {
              id: 'design-and-architect-solutions',
              name: 'Design and architect solutions',
              subProcesses: []
            },
            {
              id: 'build-and-configure-solutions',
              name: 'Build and configure solutions',
              subProcesses: []
            },
            {
              id: 'conduct-validation-and-testing',
              name: 'Conduct validation and testing',
              subProcesses: []
            },
            {
              id: 'prepare-solution-deployment',
              name: 'Prepare solution deployment',
              subProcesses: []
            }
          ]
        }
      ]
    },
    {
      id: 'operate-solutions',
      title: 'Operate solutions',
      description: 'Solution operations and cybersecurity processes',
      color: {
        header: '#dfe0ef',
        background: '#dfe0ef',
        process: '#9395c7',
      },
      categories: [
        {
          id: 'solutions-operations',
          title: 'SOLUTIONS OPERATIONS',
          processes: [
            {
              id: 'manage-solution-monitoring-alerting',
              name: 'Manage solution monitoring & alerting',
              subProcesses: []
            },
            {
              id: 'manage-events-incidents',
              name: 'Manage events & incidents',
              subProcesses: []
            },
            {
              id: 'manage-changes-configurations',
              name: 'Manage changes & configurations',
              subProcesses: []
            },
            {
              id: 'manage-availability-and-capacity',
              name: 'Manage availability and capacity',
              subProcesses: []
            },
            {
              id: 'ensure-systems-resilience',
              name: 'Ensure systems resilience',
              subProcesses: []
            },
            {
              id: 'provision-office-applications-and-devices',
              name: 'Provision office applications and devices',
              subProcesses: []
            }
          ]
        },
        {
          id: 'cybersecurity-operations',
          title: 'CYBERSECURITY OPERATIONS',
          processes: [
            {
              id: 'implement-manage-identity-access-controls',
              name: 'Implement & manage identity & access controls',
              subProcesses: []
            },
            {
              id: 'secure-data-at-rest-and-in-transit',
              name: 'Secure data at rest and in transit',
              subProcesses: []
            },
            {
              id: 'apply-endpoint-protection-and-system-hardening',
              name: 'Apply endpoint protection and system hardening',
              subProcesses: []
            },
            {
              id: 'manage-operational-cybersecurity-soc',
              name: 'Manage operational cybersecurity (SOC)',
              subProcesses: []
            }
          ]
        }
      ]
    },
    {
      id: 'support-users',
      title: 'Support users',
      description: 'User support and service improvement processes',
      color: {
        header: '#dfe0ef',
        background: '#dfe0ef',
        process: '#9395c7',
      },
      categories: [
        {
          id: 'support-improvement',
          title: 'SUPPORT & IMPROVEMENT',
          processes: [
            {
              id: 'maintain-product-service-catalog',
              name: 'Maintain product & service catalog',
              subProcesses: []
            },
            {
              id: 'monitor-sla-and-service-performance',
              name: 'Monitor SLA and service performance',
              subProcesses: []
            },
            {
              id: 'manage-requests',
              name: 'Manage requests',
              subProcesses: []
            },
            {
              id: 'manage-problems',
              name: 'Manage problems',
              subProcesses: []
            },
            {
              id: 'deliver-user-documentation-training',
              name: 'Deliver user documentation & training',
              subProcesses: []
            },
            {
              id: 'improve-based-on-user-satisfaction',
              name: 'Improve based on user satisfaction',
              subProcesses: []
            }
          ]
        }
      ]
    },
    // Niveau Bas
    {
      id: 'steer-resources',
      title: 'Steer Resources',
      description: 'Resource management and organizational processes',
      color: {
        header: '#f3f4f6',
        background: '#eff6ff',
        process: '#00799a',
      },
      categories: [
        {
          id: 'it-finance-controlling',
          title: 'IT FINANCE & CONTROLLING',
          processes: [
            {
              id: 'manage-budgets-and-invest',
              name: 'Manage budgets and invest',
              subProcesses: []
            },
            {
              id: 'allocate-costs',
              name: 'Allocate costs',
              subProcesses: []
            },
            {
              id: 'control-costs-and-performance',
              name: 'Control costs and performance',
              subProcesses: []
            },
            {
              id: 'perform-billing-and-reporting-to-customers',
              name: 'Perform billing and reporting to customers',
              subProcesses: []
            }
          ]
        },
        {
          id: 'it-organization-hr',
          title: 'IT ORGANIZATION & HR',
          processes: [
            {
              id: 'design-manage-organization-structure',
              name: 'Design & manage organization structure',
              subProcesses: []
            },
            {
              id: 'plan-strategic-workforce',
              name: 'Plan strategic workforce',
              subProcesses: []
            },
            {
              id: 'manage-capacity-and-staffing',
              name: 'Manage capacity and staffing',
              subProcesses: []
            },
            {
              id: 'manage-trainings-and-knowledge',
              name: 'Manage trainings and knowledge',
              subProcesses: []
            },
            {
              id: 'lead-change-and-manage-communication',
              name: 'Lead change and manage communication',
              subProcesses: []
            }
          ]
        },
        {
          id: 'it-asset-management',
          title: 'IT ASSET MANAGEMENT',
          processes: [
            {
              id: 'manage-application-portfolio-apm',
              name: 'Manage application portfolio (APM)',
              subProcesses: []
            },
            {
              id: 'manage-software-assets-sam',
              name: 'Manage software assets (SAM)',
              subProcesses: []
            },
            {
              id: 'manage-hardware-assets-ham',
              name: 'Manage hardware assets (HAM)',
              subProcesses: []
            }
          ]
        },
        {
          id: 'it-sourcing-procurement',
          title: 'IT SOURCING & PROCUREMENT',
          processes: [
            {
              id: 'define-sourcing-strategy',
              name: 'Define sourcing strategy',
              subProcesses: []
            },
            {
              id: 'select-supplier-and-manage-transition',
              name: 'Select supplier and manage transition',
              subProcesses: []
            },
            {
              id: 'manage-service-supply',
              name: 'Manage service supply',
              subProcesses: []
            },
            {
              id: 'manage-vendor-relationships-and-contracts',
              name: 'Manage vendor relationships and contracts',
              subProcesses: []
            }
          ]
        }
      ]
    }
  ]);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  return (
    <FrameworkContext.Provider value={{ frameworkData, setFrameworkData, lastSaved, setLastSaved }}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (context === undefined) {
    throw new Error('useFramework must be used within a FrameworkProvider');
  }
  return context;
}