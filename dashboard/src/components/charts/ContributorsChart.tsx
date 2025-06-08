import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ContributorStats } from '../../types';
import { chartOptions, chartColors } from './ChartConfig';

interface ContributorsChartProps {
  data: ContributorStats[];
}

export const ContributorsChart: React.FC<ContributorsChartProps> = ({ data }) => {
  const topContributors = data.slice(0, 10); // Show top 10 contributors

  const chartData = {
    labels: topContributors.map(c => c.user_login),
    datasets: [
      {
        label: 'Total PRs',
        data: topContributors.map(c => c.pr_count),
        backgroundColor: chartColors.primary,
        borderRadius: 4,
        maxBarThickness: 60,
      },
      {
        label: 'Merged PRs',
        data: topContributors.map(c => c.merged_count),
        backgroundColor: chartColors.secondary,
        borderRadius: 4,
        maxBarThickness: 60,
      },
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Top Contributors by PR Count',
        color: '#F3F4F6',
      },
    },
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: 'Contributors',
          color: '#D1D5DB',
        },
      },
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Number of PRs',
          color: '#D1D5DB',
        },
      },
    },
  };

  return (
    <div className="h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};