import React, { useState } from 'react';
import { 
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit2,
  Edit,
  AlertCircle,
  History,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFramework } from '../contexts/FrameworkContext';
import { useNavigate } from 'react-router-dom';

export function FrameworkManagement() {
  const { frameworkData, setFrameworkData, lastSaved, setLastSaved } = useFramework();
  const navigate = useNavigate();
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{
    type: 'domain' | 'category' | 'process' | 'subprocess';
    id: string;
    value: string;
  } | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSave = () => {
    setLastSaved(new Date());
  };

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      handleSave();
    }, 1000); // Auto-save after 1 second of inactivity
    
    setAutoSaveTimeout(timeout);
  };
  const handleAddDomain = () => {
    const newDomain = {
      id: `domain-${Date.now()}`,
      title: 'New Domain',
      description: 'Domain description',
      categories: []
    };
    setFrameworkData([...frameworkData, newDomain]);
    triggerAutoSave();
  };

  const handleAddCategory = (domainId: string) => {
    const newCategory = {
      id: `category-${Date.now()}`,
      title: 'New Category',
      processes: []
    };
    setFrameworkData(frameworkData.map(domain => {
      if (domain.id === domainId) {
        return {
          ...domain,
          categories: [...domain.categories, newCategory]
        };
      }
      return domain;
    }));
    triggerAutoSave();
  };

  const handleAddProcess = (domainId: string, categoryId: string) => {
    const newProcess = {
      id: `process-${Date.now()}`,
      name: 'New Process',
      subProcesses: []
    };
    setFrameworkData(frameworkData.map(domain => {
      if (domain.id === domainId) {
        return {
          ...domain,
          categories: domain.categories.map(category => {
            if (category.id === categoryId) {
              return {
                ...category,
                processes: [...category.processes, newProcess]
              };
            }
            return category;
          })
        };
      }
      return domain;
    }));
    triggerAutoSave();
  };

  const handleDelete = (type: 'domain' | 'category' | 'process', ids: { domainId: string; categoryId?: string; processId?: string }) => {
    const { domainId, categoryId, processId } = ids;
    
    if (type === 'domain') {
      setFrameworkData(frameworkData.filter(domain => domain.id !== domainId));
    } else if (type === 'category') {
      setFrameworkData(frameworkData.map(domain => {
        if (domain.id === domainId) {
          return {
            ...domain,
            categories: domain.categories.filter(category => category.id !== categoryId)
          };
        }
        return domain;
      }));
    } else if (type === 'process') {
      setFrameworkData(frameworkData.map(domain => {
        if (domain.id === domainId) {
          return {
            ...domain,
            categories: domain.categories.map(category => {
              if (category.id === categoryId) {
                return {
                  ...category,
                  processes: category.processes.filter(process => process.id !== processId)
                };
              }
              return category;
            })
          };
        }
        return domain;
      }));
    }
    triggerAutoSave();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(frameworkData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'framework-structure.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-bree text-3xl text-blue-dark mb-2">Framework Management</h1>
          <p className="text-gray">Manage and customize the IT Capability Framework structure</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 text-gray hover:text-blue transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
          <label className="flex items-center space-x-2 px-4 py-2 text-gray hover:text-blue transition-colors cursor-pointer">
            <Upload className="h-5 w-5" />
            <span>Import</span>
            <input type="file" className="hidden" accept=".json" onChange={() => {}} />
          </label>
          <div className="flex items-center space-x-2 text-gray">
            <History className="h-5 w-5" />
            <span>
              {lastSaved 
                ? `Auto-saved: ${lastSaved.toLocaleTimeString()}`
                : 'Auto-save enabled'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddDomain}
                className="flex items-center space-x-2 px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Domain</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {frameworkData.map(domain => (
              <div key={domain.id} className="border border-gray-200 rounded-lg">
                <div className="p-4 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setExpandedDomain(
                          expandedDomain === domain.id ? null : domain.id
                        )}
                        className="text-gray hover:text-blue transition-colors"
                      >
                        {expandedDomain === domain.id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-bree text-xl text-blue-dark">{domain.title}</h3>
                        <p className="text-gray text-sm">{domain.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddCategory(domain.id)}
                        className="p-2 text-gray hover:text-blue transition-colors"
                        title="Add Category"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete('domain', { domainId: domain.id })}
                        className="p-2 text-gray hover:text-red-500 transition-colors"
                        title="Delete Domain"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedDomain === domain.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 space-y-4">
                        {domain.categories.map(category => (
                          <div key={category.id} className="ml-8 border border-gray-200 rounded-lg">
                            <div className="p-3 bg-white rounded-t-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <button
                                    onClick={() => setExpandedCategory(
                                      expandedCategory === category.id ? null : category.id
                                    )}
                                    className="text-gray hover:text-blue transition-colors"
                                  >
                                    {expandedCategory === category.id ? (
                                      <ChevronDown className="h-5 w-5" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5" />
                                    )}
                                  </button>
                                  <h4 className="font-din text-lg">{category.title}</h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleAddProcess(domain.id, category.id)}
                                    className="p-2 text-gray hover:text-blue transition-colors"
                                    title="Add Process"
                                  >
                                    <Plus className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete('category', { domainId: domain.id, categoryId: category.id })}
                                    className="p-2 text-gray hover:text-red-500 transition-colors"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedCategory === category.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-gray-200"
                                >
                                  <div className="p-3 space-y-2">
                                    {category.processes.map(process => (
                                      <div
                                        key={process.id}
                                        className="ml-8 p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-din">{process.name}</span>
                                          <div className="flex items-center space-x-2">
                                            <button
                                              onClick={() => navigate(`/process-editor/${process.id}`)}
                                              className="p-1 text-gray hover:text-blue transition-colors"
                                              title="Éditer le processus"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDelete('process', {
                                                domainId: domain.id,
                                                categoryId: category.id,
                                                processId: process.id
                                              })}
                                              className="p-1 text-gray hover:text-red-500 transition-colors"
                                              title="Delete Process"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                        {process.subProcesses && process.subProcesses.length > 0 && (
                                          <div className="mt-2 ml-4 space-y-1">
                                            {process.subProcesses.map((subProcess, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between text-sm text-gray"
                                              >
                                                <span>{subProcess}</span>
                                                <button
                                                  onClick={() => {}}
                                                  className="p-1 text-gray hover:text-blue transition-colors"
                                                  title="Edit Sub-process"
                                                >
                                                  <Edit2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}