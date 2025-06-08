import React from 'react';
import { Line } from 'react-chartjs-2';
import { VolumeData } from '../../types';
import { chartOptions, chartColors } from './ChartConfig';

interface VolumeChartProps {
  data: VolumeData[];
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Created',
        data: data.map(d => d.created),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + '20',
        tension: 0.3,
      },
      {
        label: 'Merged',
        data: data.map(d => d.merged),
        borderColor: chartColors.secondary,
        backgroundColor: chartColors.secondary + '20',
        tension: 0.3,
      },
      {
        label: 'Closed',
        data: data.map(d => d.closed),
        borderColor: chartColors.danger,
        backgroundColor: chartColors.danger + '20',
        tension: 0.3,
      },
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'PR Volume Trend (Last 30 Days)',
        color: '#F3F4F6',
      },
    },
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: 'Date',
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
      <Line data={chartData} options={options} />
    </div>
  );
};