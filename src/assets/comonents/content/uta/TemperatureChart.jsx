import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TemperatureChart({
  data,
  height = 300,
  dataKey,
  label
}) {

  const chartLabels = data.map((d, index) => d.time || `Point ${index + 1}`);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: label,
        data: data.map(d => d[dataKey]),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "red",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: label,
      },
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "Data dhe Ora",
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
        },
        suggestedMin: 15,
        suggestedMax: 40,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
}