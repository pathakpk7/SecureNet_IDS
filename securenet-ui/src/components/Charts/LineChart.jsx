import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function LineChart() {
  const data = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    datasets: [
      {
        label: "Network Traffic",
        data: [120, 150, 180, 220, 190, 160],
        backgroundColor: "rgba(0,245,255,0.2)",
        borderColor: "#00f5ff",
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff"
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#8b9bb4" },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: {
        ticks: { color: "#8b9bb4" },
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    }
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} key="line-static" />
    </div>
  );
}

export default LineChart;
