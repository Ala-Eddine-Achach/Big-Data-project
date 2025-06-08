import { AnalyticsData, PRData, PRStateBreakdown, ContributorStats, VolumeData, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async getAnalytics(): Promise<AnalyticsData[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/analytics`);
      
      if (!response.ok) {
        // Return mock data if API is not available
        return this.getMockAnalytics();
      }
      
      const result: ApiResponse<AnalyticsData[]> = await response.json();
      return result.data || result;
    } catch (error) {
      console.warn('Analytics API unavailable, using mock data:', error);
      return this.getMockAnalytics();
    }
  }

  async getPRs(): Promise<PRData[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/prs`);
      
      if (!response.ok) {
        return this.getMockPRs();
      }
      
      const result: ApiResponse<PRData[]> = await response.json();
      return result.data || result;
    } catch (error) {
      console.warn('PRs API unavailable, using mock data:', error);
      return this.getMockPRs();
    }
  }

  async getPRStateBreakdown(): Promise<PRStateBreakdown[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pr-states`);
      
      if (!response.ok) {
        return this.getMockPRStateBreakdown();
      }
      
      const result: ApiResponse<PRStateBreakdown[]> = await response.json();
      return result.data || result;
    } catch (error) {
      console.warn('PR States API unavailable, using mock data:', error);
      return this.getMockPRStateBreakdown();
    }
  }

  async getTopContributors(): Promise<ContributorStats[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/contributors`);
      
      if (!response.ok) {
        return this.getMockContributors();
      }
      
      const result: ApiResponse<ContributorStats[]> = await response.json();
      return result.data || result;
    } catch (error) {
      console.warn('Contributors API unavailable, using mock data:', error);
      return this.getMockContributors();
    }
  }

  async getVolumeData(): Promise<VolumeData[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/volume`);
      
      if (!response.ok) {
        return this.getMockVolumeData();
      }
      
      const result: ApiResponse<VolumeData[]> = await response.json();
      return result.data || result;
    } catch (error) {
      console.warn('Volume API unavailable, using mock data:', error);
      return this.getMockVolumeData();
    }
  }

  // Mock data generators for demonstration
  private getMockAnalytics(): AnalyticsData[] {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: AnalyticsData[] = [];
    
    for (const weekday of weekdays) {
      for (let slot = 0; slot < 6; slot++) {
        data.push({
          weekday,
          slot,
          merged_count: Math.floor(Math.random() * 10) + 1,
          avg_merge_time_hours: Math.round((Math.random() * 8 + 1) * 10) / 10,
        });
      }
    }
    
    return data;
  }

  private getMockPRs(): PRData[] {
    const states: ('open' | 'closed' | 'merged')[] = ['open', 'closed', 'merged'];
    const users = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank'];
    const repos = ['frontend', 'backend', 'mobile', 'infrastructure'];
    
    return Array.from({ length: 20 }, (_, i) => {
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const state = states[Math.floor(Math.random() * states.length)];
      
      return {
        id: i + 1,
        number: 1000 + i,
        title: `Fix issue #${Math.floor(Math.random() * 500)} - ${['Performance improvement', 'Bug fix', 'Feature enhancement', 'Security update'][Math.floor(Math.random() * 4)]}`,
        user_login: users[Math.floor(Math.random() * users.length)],
        state,
        created_at: createdAt.toISOString(),
        updated_at: new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
        merged_at: state === 'merged' ? new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        html_url: `https://github.com/company/${repos[Math.floor(Math.random() * repos.length)]}/pull/${1000 + i}`,
        repository: repos[Math.floor(Math.random() * repos.length)],
        additions: Math.floor(Math.random() * 500),
        deletions: Math.floor(Math.random() * 200),
        changed_files: Math.floor(Math.random() * 15) + 1,
      };
    });
  }

  private getMockPRStateBreakdown(): PRStateBreakdown[] {
    return [
      { state: 'open', count: 45, percentage: 30 },
      { state: 'merged', count: 75, percentage: 50 },
      { state: 'closed', count: 30, percentage: 20 },
    ];
  }

  private getMockContributors(): ContributorStats[] {
    const users = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank'];
    
    return users.map(user => ({
      user_login: user,
      pr_count: Math.floor(Math.random() * 50) + 10,
      merged_count: Math.floor(Math.random() * 40) + 5,
      avg_merge_time: Math.round((Math.random() * 48 + 6) * 10) / 10,
    })).sort((a, b) => b.pr_count - a.pr_count);
  }

  private getMockVolumeData(): VolumeData[] {
    const data: VolumeData[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        created: Math.floor(Math.random() * 15) + 5,
        merged: Math.floor(Math.random() * 12) + 3,
        closed: Math.floor(Math.random() * 5) + 1,
      });
    }
    
    return data;
  }
}

export const apiService = new ApiService();