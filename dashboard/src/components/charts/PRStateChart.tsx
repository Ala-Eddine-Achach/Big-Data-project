import React from 'react';
import { Pie } from 'react-chartjs-2';
import { PRStateBreakdown } from '../../types';
import { chartOptions, chartColors } from './ChartConfig';

interface PRStateChartProps {
  data: PRStateBreakdown[];
}

export const PRStateChart: React.FC<PRStateChartProps> = ({ data }) => {
  const stateColors = {
    open: chartColors.accent,
    merged: chartColors.secondary,
    closed: chartColors.danger,
  };

  const chartData = {
    labels: data.map(d => d.state.charAt(0).toUpperCase() + d.state.slice(1)),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: data.map(d => stateColors[d.state as keyof typeof stateColors]),
        borderColor: '#1F2937',
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'PR State Distribution',
        color: '#F3F4F6',
      },
      legend: {
        ...chartOptions.plugins.legend,
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="h-[400px] flex items-center justify-center">
      <div className="w-80 h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};