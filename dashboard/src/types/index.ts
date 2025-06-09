export interface AnalyticsData {
  _id: string;
  weekday: string;
  slot: number;
  merged_count: number;
  avg_merge_time_hours: number;
}

export interface PRData {
  id: string;
  number: number;
  title: string;
  user_login: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  merged_at?: string;
  html_url: string;
  repository: string;
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export interface PRStateBreakdown {
  state: string;
  count: number;
  percentage: number;
}

export interface ContributorStats {
  user_login: string;
  pr_count: number;
  merged_count: number;
  avg_merge_time: number;
}

export interface VolumeData {
  date: string;
  created: number;
  merged: number;
  closed: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}