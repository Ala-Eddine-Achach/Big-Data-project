import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
  Filler
);

export const chartColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#D1D5DB',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#F3F4F6',
      bodyColor: '#D1D5DB',
      borderColor: '#374151',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#9CA3AF',
      },
      grid: {
        color: '#374151',
      },
    },
    y: {
      ticks: {
        color: '#9CA3AF',
      },
      grid: {
        color: '#374151',
      },
    },
  },
};