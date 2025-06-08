import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { DashboardCard } from './DashboardCard';
import { PRHeatmap } from './charts/PRHeatmap';
import { MergeTimeChart } from './charts/MergeTimeChart';
import { PRStateChart } from './charts/PRStateChart';
import { VolumeChart } from './charts/VolumeChart';
import { ContributorsChart } from './charts/ContributorsChart';
import { PRFeed } from './PRFeed';
import { RefreshCw, TrendingUp, GitPullRequest, Users, Clock } from 'lucide-react';
import { AnalyticsData, PRData } from '../types';

const REFRESH_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '10000');

export const Dashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [prsData, setPrsData] = useState<PRData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [prsLoading, setPrsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch for analytics data
    apiService.getAnalytics().then(data => {
      setAnalyticsData(data);
      setAnalyticsLoading(false);
      console.log("Initial Analytics Data fetched:", data);
    }).catch(error => {
      console.error("Error fetching initial analytics data:", error);
      setAnalyticsLoading(false);
    });

    // Initial fetch for PRs data
    apiService.getPRs().then(data => {
      setPrsData(data);
      setPrsLoading(false);
      console.log("Initial PRs Data fetched:", data);
    }).catch(error => {
      console.error("Error fetching initial PRs data:", error);
      setPrsLoading(false);
    });

    // Connect to WebSocket for real-time updates
    apiService.connectSocket(
      (newAnalyticsData: AnalyticsData) => {
        setAnalyticsData((prevData: AnalyticsData[]) => {
          const existingIndex = prevData.findIndex((item: AnalyticsData) => item.weekday === newAnalyticsData.weekday && item.slot === newAnalyticsData.slot);
          if (existingIndex > -1) {
            const updatedData = [...prevData];
            updatedData[existingIndex] = newAnalyticsData;
            console.log("Real-time Analytics Data Updated:", newAnalyticsData);
            return updatedData;
          } else {
            console.log("Real-time Analytics Data Added:", newAnalyticsData);
            return [...prevData, newAnalyticsData];
          }
        });
      },
      (newPrsData: PRData) => {
        setPrsData((prevData: PRData[]) => {
          const existingIndex = prevData.findIndex((item: PRData) => item.number === newPrsData.number);
          if (existingIndex > -1) {
            const updatedData = [...prevData];
            updatedData[existingIndex] = newPrsData;
            console.log("Real-time PRs Data Updated:", newPrsData);
            return updatedData;
          } else {
            console.log("Real-time PRs Data Added:", newPrsData);
            return [newPrsData, ...prevData]; // Add new PRs to the top
          }
        });
      }
    );

    return () => {
      apiService.disconnectSocket();
    };
  }, []);

  // Remaining useApi hooks for data that doesn't update via WebSocket in this example
  const {
    data: stateData,
    loading: stateLoading,
    error: stateError,
    refetch: refetchState,
  } = useApi(() => apiService.getPRStateBreakdown());

  const {
    data: contributorsData,
    loading: contributorsLoading,
    error: contributorsError,
    refetch: refetchContributors,
  } = useApi(() => apiService.getTopContributors());

  const {
    data: volumeData,
    loading: volumeLoading,
    error: volumeError,
    refetch: refetchVolume,
  } = useApi(() => apiService.getVolumeData());

  const handleRefreshAll = () => {
    // For real-time data, we don't need to refetch, WebSocket handles it.
    // We only refetch data that is not handled by WebSocket.
    refetchState();
    refetchContributors();
    refetchVolume();
  };

  // Calculate summary statistics
  const totalPRs = prsData?.length || 0;
  const openPRs = prsData?.filter((pr: PRData) => pr.state === 'open').length || 0;
  const mergedPRs = prsData?.filter((pr: PRData) => pr.state === 'merged').length || 0;
  const avgMergeTime = analyticsData?.reduce((sum: number, d: AnalyticsData) => sum + d.avg_merge_time_hours, 0) / (analyticsData?.length || 1) || 0;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">GitHub PR Analytics</h1>
            <p className="text-gray-400">Real-time insights into your pull request workflow</p>
          </div>
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total PRs</p>
                <p className="text-2xl font-bold">{totalPRs}</p>
              </div>
              <GitPullRequest className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Open PRs</p>
                <p className="text-2xl font-bold">{openPRs}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Merged PRs</p>
                <p className="text-2xl font-bold">{mergedPRs}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Merge Time</p>
                <p className="text-2xl font-bold">{avgMergeTime.toFixed(1)}h</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardCard
            title="PR Merge Activity"
            subtitle="PRs merged by time slot and weekday"
            loading={analyticsLoading}
            error={null}
            onRetry={null}
          >
            {analyticsLoading ? (
              <div className="text-center text-gray-500 py-10">Loading analytics data...</div>
            ) : analyticsData.length > 0 ? (
              <PRHeatmap data={analyticsData} />
            ) : (
              <div className="text-center text-gray-500 py-10">No PR merge activity data available yet.</div>
            )}
          </DashboardCard>

          <DashboardCard
            title="Average Merge Time"
            subtitle="Time taken to merge PRs by weekday"
            loading={analyticsLoading}
            error={null}
            onRetry={null}
          >
            {analyticsLoading ? (
              <div className="text-center text-gray-500 py-10">Loading average merge time data...</div>
            ) : analyticsData.length > 0 ? (
              <MergeTimeChart data={analyticsData} />
            ) : (
              <div className="text-center text-gray-500 py-10">No average merge time data available yet.</div>
            )}
          </DashboardCard>

          <DashboardCard
            title="PR State Distribution"
            subtitle="Breakdown of PR states"
            loading={stateLoading}
            error={stateError}
            onRetry={refetchState}
          >
            {stateData && <PRStateChart data={stateData} />}
          </DashboardCard>

          <DashboardCard
            title="Top Contributors"
            subtitle="Most active contributors by PR count"
            loading={contributorsLoading}
            error={contributorsError}
            onRetry={refetchContributors}
          >
            {contributorsData && <ContributorsChart data={contributorsData} />}
          </DashboardCard>
        </div>

        {/* Volume Chart - Full Width */}
        <div className="mb-8">
          <DashboardCard
            title="PR Volume Trend"
            subtitle="Daily PR activity over the last 30 days"
            loading={volumeLoading}
            error={volumeError}
            onRetry={refetchVolume}
          >
            {volumeData && <VolumeChart data={volumeData} />}
          </DashboardCard>
        </div>

        {/* Live PR Feed */}
        <DashboardCard
          title="Live PR Feed"
          subtitle={`Latest pull requests (auto-refreshes every ${REFRESH_INTERVAL / 1000}s)`}
          loading={prsLoading}
          error={null}
          onRetry={null}
          className="min-h-[600px]"
        >
          {prsLoading ? (
            <div className="text-center text-gray-500 py-10">Loading live PR feed...</div>
          ) : prsData.length > 0 ? (
            <PRFeed data={prsData} />
          ) : (
            <div className="text-center text-gray-500 py-10">No live PR data available yet.</div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};