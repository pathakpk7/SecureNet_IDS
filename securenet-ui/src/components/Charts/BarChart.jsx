import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Attacks",
        data: [12, 19, 3, 5, 2],
        backgroundColor: "#00f5ff",
        borderColor: "#00f5ff",
        borderWidth: 1
      }
    ]
  };

  const options = {
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

  return <Bar data={data} options={options} key="bar-static" />;
}

export default BarChart;
