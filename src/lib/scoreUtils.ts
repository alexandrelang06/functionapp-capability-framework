import { Domain, Category } from '../contexts/FrameworkContext';

interface Score {
  processId: string;
  score: number;
}

interface CategoryScore {
  category_id: string;
  manual_score: number | null;
  is_manual: boolean;
}

export function calculateProcessScore(scores: Score[], processId: string): number {
  const score = scores.find(s => s.processId === processId);
  return score?.score || 0;
}

export function calculateCategoryScore(scores: Score[], category: Category, categoryScores?: CategoryScore[]): number {
  // Check if we have a manual score for this category
  const manualScoreEntry = categoryScores?.find(cs => cs.category_id === category.id);
  
  // If we have a category score entry (manual or automatic), use it
  if (manualScoreEntry && manualScoreEntry.manual_score !== null) {
    return manualScoreEntry.manual_score;
  }

  // Otherwise calculate from process scores
  const processScores = category.processes
    .map(p => calculateProcessScore(scores, p.id))
    .filter(score => score > 0); // Exclude N/A scores (0)

  if (processScores.length === 0) return 0;
  
  // Calculate the average and round to 1 decimal place
  const sum = processScores.reduce((a, b) => a + b, 0);
  const avg = sum / processScores.length;
  return Math.round(avg * 10) / 10; // Round to 1 decimal place
}

export function calculateDomainScore(scores: Score[], domain: Domain, categoryScores?: CategoryScore[]): number {
  // Calculate scores for each category in the domain, respecting manual scores
  const categoryScoresData = domain.categories
    .map(category => calculateCategoryScore(scores, category, categoryScores))
    .filter(score => score > 0);

  if (categoryScoresData.length === 0) return 0;
  const avg = categoryScoresData.reduce((a, b) => a + b, 0) / categoryScoresData.length;
  return Math.ceil(avg * 10) / 10;
}

export function calculateGlobalScore(scores: Score[], domains: Domain[], categoryScores?: CategoryScore[]): number {
  // Calculate scores for each domain, respecting manual category scores
  const domainScores = domains
    .map(domain => calculateDomainScore(scores, domain, categoryScores))
    .filter(score => score > 0);

  if (domainScores.length === 0) return 0;
  const avg = domainScores.reduce((a, b) => a + b, 0) / domainScores.length;
  return Math.ceil(avg * 10) / 10;
}