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

const DEFAULT_BAR_DATA = {
  labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
  datasets: [
    {
      label: "Attacks Intercepted",
      data: [6, 14, 28, 22, 35, 18],
      backgroundColor: "rgba(0, 245, 255, 0.65)",
      borderColor: "#00f5ff",
      borderWidth: 1.5,
      borderRadius: 6,
      hoverBackgroundColor: "rgba(0, 245, 255, 0.9)"
    }
  ]
};

function BarChart({ data, title, height = "100%", options: customOptions, horizontal = false }) {
  let chartData = DEFAULT_BAR_DATA;

  if (data) {
    if (data.labels && data.datasets && data.datasets.length > 0) {
      chartData = data;
    } else if (data.labels && data.values) {
      const isNoData = data.labels.length === 1 && data.labels[0] === 'No Data' && data.values[0] === 0;
      if (!isNoData && data.values.length > 0) {
        chartData = {
          labels: data.labels,
          datasets: [
            {
              label: title || "Threat Frequency",
              data: data.values,
              backgroundColor: "rgba(0, 245, 255, 0.65)",
              borderColor: "#00f5ff",
              borderWidth: 1.5,
              borderRadius: 6,
              hoverBackgroundColor: "rgba(0, 245, 255, 0.9)"
            }
          ]
        };
      }
    }
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: {
        display: !!title,
        labels: {
          color: "#94a3b8",
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
            weight: "600"
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(0, 245, 255, 0.3)",
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        ticks: { 
          color: "#8b9bb4",
          font: { family: "Inter, system-ui, sans-serif", size: 10 }
        },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: "#8b9bb4",
          font: { family: "Inter, system-ui, sans-serif", size: 10 }
        },
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    },
    ...customOptions
  };

  return (
    <div style={{ width: "100%", height: height, position: "relative" }}>
      <Bar data={chartData} options={defaultOptions} />
    </div>
  );
}

export default BarChart;
