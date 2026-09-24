import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartDoughnut({ data = [0, 0, 0] }) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#E5E7EB' : '#0F172A';

  const chartData = {
    labels: ['Electricity', 'Transport', 'Food'],
    datasets: [
      {
        data: data,
        backgroundColor: ['#EAB308', '#3B82F6', '#22C55E'],
        borderColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12, weight: '500' },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} kg CO₂`
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div style={{ height: '240px', position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
