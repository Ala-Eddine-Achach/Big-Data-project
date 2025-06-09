import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DashboardCard } from './DashboardCard';
import { PRHeatmap } from './charts/PRHeatmap';
import { MergeTimeChart } from './charts/MergeTimeChart';
import { PRStateChart } from './charts/PRStateChart';
import { VolumeChart } from './charts/VolumeChart';
import { ContributorsChart } from './charts/ContributorsChart';
import { GitPullRequest, Users, Clock, ExternalLink, User, Calendar, Loader2, BarChart, TrendingUp } from 'lucide-react';
import { AnalyticsData, PRData, PRStateBreakdown, ContributorStats, VolumeData } from '../types';

const REFRESH_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '10000');

export const Dashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [prsData, setPrsData] = useState<PRData[]>([]);
  const [rawPrsCount, setRawPrsCount] = useState<number | null>(null);
  const [analyticsCount, setAnalyticsCount] = useState<number | null>(null);
  const [latestPopUpPR, setLatestPopUpPR] = useState<PRData | null>(null);

  // For real-time updates of specific charts that don't come via main analytics stream
  const [stateData, setStateData] = useState<PRStateBreakdown[]>([]);
  const [contributorsData, setContributorsData] = useState<ContributorStats[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.connectSocket(
      // onAnalyticsUpdate (real-time single analytics update)
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
      // onPRsUpdate (real-time single raw PR update from Kafka)
      (newPrsData: PRData) => {
        setPrsData((prevData: PRData[]) => {
          const existingIndex = prevData.findIndex((item: PRData) => item.id === newPrsData.id);
          if (existingIndex > -1) {
            const updatedData = [...prevData];
            updatedData[existingIndex] = newPrsData;
            console.log("Real-time PRs Data Updated:", newPrsData);
            return updatedData;
          } else {
            console.log("Real-time PRs Data Added:", newPrsData);
            return [newPrsData, ...prevData];
          }
        });
        setLatestPopUpPR(newPrsData);
      },
      // onInitialAnalytics (initial load of analytics data)
      (initialAnalytics: AnalyticsData[]) => {
        setAnalyticsData(initialAnalytics);
        console.log("Initial Analytics Data Loaded via WebSocket:", initialAnalytics);
      },
      // onStatusCounts (initial and updated counts)
      (counts: { raw_prs_count: number; analytics_count: number }) => {
        setRawPrsCount(counts.raw_prs_count);
        setAnalyticsCount(counts.analytics_count);
        console.log("Status Counts Updated via WebSocket:", counts);
      },
      // onDataDelete (delete event for analytics or PRs - handle as needed)
      (id: string) => {
        setPrsData(prevData => prevData.filter((pr: PRData) => pr.id !== id));
        setAnalyticsData(prevData => prevData.filter((item: AnalyticsData) => String(item._id) !== id));
        console.log("Document with ID deleted:", id);
      }
    );

    setLoading(false);

    return () => {
      apiService.disconnectSocket();
    };
  }, []);

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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total PRs</p>
                <p className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin" /> : totalPRs}</p>
              </div>
              <GitPullRequest className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Open PRs</p>
                <p className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin" /> : openPRs}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Merged PRs</p>
                <p className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin" /> : mergedPRs}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Merge Time</p>
                <p className="text-2xl font-bold">{loading ? <Loader2 className="animate-spin" /> : avgMergeTime.toFixed(1)}h</p>
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
            loading={loading}
            error={null}
            onRetry={null}
          >
            {loading ? (
              <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Loading analytics data...</div>
            ) : analyticsData.length > 0 ? (
              <PRHeatmap data={analyticsData} />
            ) : (
              <div className="text-center text-gray-500 py-10">No PR merge activity data available yet.</div>
            )}
          </DashboardCard>

          <DashboardCard
            title="Average Merge Time"
            subtitle="Time taken to merge PRs by weekday"
            loading={loading}
            error={null}
            onRetry={null}
          >
            {loading ? (
              <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Loading average merge time data...</div>
            ) : analyticsData.length > 0 ? (
              <MergeTimeChart data={analyticsData} />
            ) : (
              <div className="text-center text-gray-500 py-10">No average merge time data available yet.</div>
            )}
          </DashboardCard>

          <DashboardCard
            title="PR State Distribution"
            subtitle="Breakdown of PR states"
            loading={loading}
            error={null}
            onRetry={null}
          >
            {loading ? (
              <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Loading PR state data...</div>
            ) : stateData && stateData.length > 0 ? (
              <PRStateChart data={stateData} />
            ) : (
              <div className="text-center text-gray-500 py-10">No PR state data available yet.</div>
            )}
          </DashboardCard>

          <DashboardCard
            title="Top Contributors"
            subtitle="Most active contributors by PR count"
            loading={loading}
            error={null}
            onRetry={null}
          >
            {loading ? (
              <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Loading contributors data...</div>
            ) : contributorsData && contributorsData.length > 0 ? (
              <ContributorsChart data={contributorsData} />
            ) : (
              <div className="text-center text-gray-500 py-10">No top contributors data available yet.</div>
            )}
          </DashboardCard>
        </div>

        {/* Volume Chart - Full Width */}
        <div className="mb-8">
          <DashboardCard
            title="PR Volume Trend"
            subtitle="Daily PR activity over the last 30 days"
            loading={loading}
            error={null}
            onRetry={null}
          >
            {loading ? (
              <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Loading volume data...</div>
            ) : volumeData && volumeData.length > 0 ? (
              <VolumeChart data={volumeData} />
            ) : (
              <div className="text-center text-gray-500 py-10">No PR volume data available yet.</div>
            )}
          </DashboardCard>
        </div>

        {/* Live PR Feed */}
        <DashboardCard
          title="Live PR Feed"
          subtitle={`Latest pull request (real-time from Kafka)`}
          loading={loading}
          error={null}
          onRetry={null}
        >
          {loading ? (
            <div className="text-center text-gray-500 py-10"><Loader2 className="animate-spin inline-block mr-2" />Waiting for PR updates...</div>
          ) : latestPopUpPR ? (
            <div className="p-4 bg-gray-800 rounded-lg shadow-lg relative">
              <a
                href={latestPopUpPR.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <h4 className="text-white font-semibold text-lg mb-2">#{latestPopUpPR.number} - {latestPopUpPR.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {latestPopUpPR.user_login}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(latestPopUpPR.created_at).toLocaleString()}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(latestPopUpPR.state)}`}
              >
                {latestPopUpPR.state}
              </span>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">No live PR data available yet. Waiting for new PRs from Kafka.</div>
          )}
        </DashboardCard>

        {/* Display raw PRs and Analytics counts */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>Total Raw PRs from Kafka: {rawPrsCount !== null ? rawPrsCount : <Loader2 className="animate-spin inline-block ml-2" />}</p>
          <p>Total Analytics Records: {analyticsCount !== null ? analyticsCount : <Loader2 className="animate-spin inline-block ml-2" />}</p>
        </div>

      </div>
    </div>
  );
};

const getStateColor = (state: string) => {
  switch (state) {
    case 'open':
      return 'text-green-400 bg-green-400/10';
    case 'merged':
      return 'text-purple-400 bg-purple-400/10';
    case 'closed':
      return 'text-red-400 bg-red-400/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
};