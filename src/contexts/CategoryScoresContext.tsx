import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase, handleDatabaseError } from '../lib/supabase';

export interface CategoryScore {
  id?: string;
  assessment_id?: string;
  category_id: string;
  manual_score: number | null;
  is_manual: boolean;
}

interface CategoryScoresContextType {
  categoryScores: CategoryScore[];
  setCategoryScores: (scores: CategoryScore[]) => void;
  updateCategoryScore: (assessmentId: string, categoryId: string, newScore: number | null, isManual: boolean) => Promise<void>;
  getCategoryScore: (categoryId: string) => CategoryScore | undefined;
  loading: boolean;
  error: string | null;
}

const CategoryScoresContext = createContext<CategoryScoresContextType | undefined>(undefined);

export function CategoryScoresProvider({ children }: { children: ReactNode }) {
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCategoryScore = useCallback(async (
    assessmentId: string, 
    categoryId: string, 
    newScore: number | null, 
    isManual: boolean
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error } = await supabase
        .from('category_scores')
        .upsert({
          assessment_id: assessmentId,
          category_id: categoryId,
          manual_score: newScore,
          is_manual: isManual
        }, {
          onConflict: 'assessment_id,category_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating category score:', error);
        throw error;
      }

      // Update local state immediately
      setCategoryScores(prev => {
        const existing = prev.findIndex(cs => cs.category_id === categoryId);
        const newScore = {
          id: result.id,
          assessment_id: result.assessment_id,
          category_id: result.category_id,
          manual_score: result.manual_score,
          is_manual: result.is_manual
        };

        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newScore;
          return updated;
        } else {
          return [...prev, newScore];
        }
      });

    } catch (err) {
      console.error('Error updating category score:', err);
      const errorMessage = handleDatabaseError(err);
      setError(`Failed to update category score: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryScore = useCallback((categoryId: string) => {
    return categoryScores.find(cs => cs.category_id === categoryId);
  }, [categoryScores]);

  const value = {
    categoryScores,
    setCategoryScores,
    updateCategoryScore,
    getCategoryScore,
    loading,
    error
  };

  return (
    <CategoryScoresContext.Provider value={value}>
      {children}
    </CategoryScoresContext.Provider>
  );
}

export function useCategoryScores() {
  const context = useContext(CategoryScoresContext);
  if (context === undefined) {
    throw new Error('useCategoryScores must be used within a CategoryScoresProvider');
  }
  return context;
}