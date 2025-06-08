import { AnalyticsData, PRData, PRStateBreakdown, ContributorStats, VolumeData, ApiResponse } from '../types';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Adjusted port to 5000 for Flask API

class ApiService {
  private socket: Socket | null = null;

  public connectSocket(onAnalyticsUpdate: (data: AnalyticsData) => void, onPRsUpdate: (data: PRData) => void) {
    if (!this.socket) {
      this.socket = io(API_BASE_URL.replace('/api', '')); // Connect to the base URL for Socket.IO

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('data_update', (data: any) => {
        // Determine if it's analytics or raw PR data based on structure/keys
        if (data.hasOwnProperty('weekday') && data.hasOwnProperty('slot')) {
            onAnalyticsUpdate(data);
        } else if (data.hasOwnProperty('number') && data.hasOwnProperty('title')) {
            onPRsUpdate(data);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (err: any) => {
        console.error('WebSocket connection error:', err);
      });
    }
  }

  public disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

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
        console.error(`API Error fetching analytics: ${response.status} ${response.statusText}`);
        return []; // Return empty array on error or non-OK response
      }
      
      const result: AnalyticsData[] = await response.json(); // Direct type assertion as API now returns array
      return result;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return []; // Return empty array on network error
    }
  }

  async getPRs(): Promise<PRData[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/raw-prs`); // Changed endpoint to raw-prs
      
      if (!response.ok) {
        console.error(`API Error fetching PRs: ${response.status} ${response.statusText}`);
        return []; // Return empty array on error or non-OK response
      }
      
      const result: PRData[] = await response.json(); // Direct type assertion
      return result;
    } catch (error) {
      console.error('Error fetching PRs data:', error);
      return []; // Return empty array on network error
    }
  }

  async getPRStateBreakdown(): Promise<PRStateBreakdown[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/pr-states`);
      
      if (!response.ok) {
        console.error(`API Error fetching PR state breakdown: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const result: PRStateBreakdown[] = await response.json();
      return result; // Direct type assertion
    } catch (error) {
      console.error('Error fetching PR state breakdown:', error);
      return [];
    }
  }

  async getTopContributors(): Promise<ContributorStats[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/contributors`);
      
      if (!response.ok) {
        console.error(`API Error fetching top contributors: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const result: ContributorStats[] = await response.json();
      return result; // Direct type assertion
    } catch (error) {
      console.error('Error fetching top contributors:', error);
      return [];
    }
  }

  async getVolumeData(): Promise<VolumeData[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/volume`);
      
      if (!response.ok) {
        console.error(`API Error fetching volume data: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const result: VolumeData[] = await response.json();
      return result; // Direct type assertion
    } catch (error) {
      console.error('Error fetching volume data:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();