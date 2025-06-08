import React from 'react';
import { Bar } from 'react-chartjs-2';
import { AnalyticsData } from '../../types';
import { chartOptions, chartColors } from './ChartConfig';

interface PRHeatmapProps {
  data: AnalyticsData[];
}

export const PRHeatmap: React.FC<PRHeatmapProps> = ({ data }) => {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const slots = Array.from({ length: 6 }, (_, i) => `${i * 4}:00-${(i + 1) * 4}:00`);

  // Group data by weekday
  const groupedData = weekdays.map(weekday => {
    const dayData = data.filter(d => d.weekday === weekday);
    return slots.map(slot => {
      const slotIndex = slots.indexOf(slot);
      const slotData = dayData.find(d => d.slot === slotIndex);
      return slotData ? slotData.merged_count : 0;
    });
  });

  const chartData = {
    labels: slots,
    datasets: weekdays.map((weekday, index) => ({
      label: weekday,
      data: groupedData[index],
      backgroundColor: Object.values(chartColors)[index % Object.values(chartColors).length],
      borderRadius: 4,
      maxBarThickness: 40,
    })),
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'PRs Merged by Time Slot and Weekday',
        color: '#F3F4F6',
      },
    },
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: 'Time Slots',
          color: '#D1D5DB',
        },
      },
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'PRs Merged',
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