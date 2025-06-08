import React from 'react';
import { Line } from 'react-chartjs-2';
import { AnalyticsData } from '../../types';
import { chartOptions, chartColors } from './ChartConfig';

interface MergeTimeChartProps {
  data: AnalyticsData[];
}

export const MergeTimeChart: React.FC<MergeTimeChartProps> = ({ data }) => {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate average merge time by weekday
  const avgMergeTimeByDay = weekdays.map(weekday => {
    const dayData = data.filter(d => d.weekday === weekday);
    const totalTime = dayData.reduce((sum, d) => sum + d.avg_merge_time_hours, 0);
    return dayData.length > 0 ? totalTime / dayData.length : 0;
  });

  const chartData = {
    labels: weekdays,
    datasets: [
      {
        label: 'Average Merge Time (hours)',
        data: avgMergeTimeByDay,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + '20',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Average PR Merge Time by Weekday',
        color: '#F3F4F6',
      },
    },
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: 'Weekday',
          color: '#D1D5DB',
        },
      },
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Hours',
          color: '#D1D5DB',
        },
      },
    },
  };

  return (
    <div className="h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  );
};