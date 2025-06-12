import { AnalyticsData, PRData } from '../types';
import { io, Socket } from 'socket.io-client';

interface StatusCounts {
  raw_prs_count: number;
  analytics_count: number;
}

function log(level: 'info' | 'warn' | 'error' | 'debug', ...args: any[]) {
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    `[${timestamp}] [${level.toUpperCase()}]`,
    ...args
  );
}

class ApiService {
  private socket: Socket | null = null;

  public connectSocket(
    onAnalyticsUpdate: (data: AnalyticsData) => void,
    onPRsUpdate: (data: PRData) => void,
    onInitialAnalytics: (data: AnalyticsData[]) => void,
    onStatusCounts: (counts: StatusCounts) => void,
    onDataDelete: (id: string) => void
  ) {
    if (!this.socket) {
      this.socket = io();

      this.socket.on('connect', () => {
        log('info', 'Connected to WebSocket server');
      });

      this.socket.on('status', (data: { msg: string }) => {
        log('info', 'Backend Status:', data.msg);
      });

      this.socket.on('initial_analytics', (data: AnalyticsData[]) => {
        onInitialAnalytics(data);
        log('info', 'Initial Analytics Data Received:', data);
      });

      this.socket.on('status_counts', (data: StatusCounts) => {
        onStatusCounts(data);
        log('info', 'Status Counts Received:', data);
      });

      this.socket.on('data_update', (data: any) => {
        if (data.hasOwnProperty('weekday') && data.hasOwnProperty('slot')) {
          onAnalyticsUpdate(data);
        }
      });

      this.socket.on('raw_pr_update', (data: PRData) => {
        onPRsUpdate(data);
        log('info', 'Real-time Raw PR Data Received:', data);
      });

      this.socket.on('data_delete', (id: string) => {
        onDataDelete(id);
        log('info', 'Data Delete Event Received for ID:', id);
      });

      this.socket.on('disconnect', () => {
        log('info', 'Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (err: any) => {
        log('error', 'WebSocket connection error:', err);
      });
    }
    return this.socket;
  }

  public disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const apiService = new ApiService();