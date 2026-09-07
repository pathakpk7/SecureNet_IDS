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
  Legend,
  Filler
} from "chart.js";
import "./LineChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DEFAULT_LABELS = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

function LineChart({ data, title, height = "100%", options: customOptions }) {
  let chartData;

  if (data && data.incoming && data.outgoing) {
    // Format: { incoming: { labels, values }, outgoing: { labels, values } }
    chartData = {
      labels: data.incoming.labels || DEFAULT_LABELS,
      datasets: [
        {
          label: "Incoming Traffic (Mbps)",
          data: data.incoming.values || [120, 150, 180, 220, 190, 160],
          borderColor: "#00f5ff",
          backgroundColor: "rgba(0, 245, 255, 0.12)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#00f5ff",
          pointBorderColor: "#0f172a"
        },
        {
          label: "Outgoing Traffic (Mbps)",
          data: data.outgoing.values || [80, 120, 140, 180, 160, 130],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#0f172a"
        }
      ]
    };
  } else if (data && data.labels && data.datasets) {
    chartData = data;
  } else if (data && data.labels && data.values) {
    chartData = {
      labels: data.labels,
      datasets: [
        {
          label: title || "Network Traffic (Mbps)",
          data: data.values,
          borderColor: "#00f5ff",
          backgroundColor: "rgba(0, 245, 255, 0.15)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#00f5ff",
          pointBorderColor: "#0f172a"
        }
      ]
    };
  } else {
    // Default fallback dataset with dual traffic flow
    chartData = {
      labels: DEFAULT_LABELS,
      datasets: [
        {
          label: "Incoming Traffic (Mbps)",
          data: [120, 150, 180, 220, 190, 160],
          borderColor: "#00f5ff",
          backgroundColor: "rgba(0, 245, 255, 0.12)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#00f5ff",
          pointBorderColor: "#0f172a"
        },
        {
          label: "Outgoing Traffic (Mbps)",
          data: [80, 120, 140, 180, 160, 130],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#0f172a"
        }
      ]
    };
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: "#94a3b8",
          padding: 12,
          font: {
            size: 11,
            family: "Inter, system-ui, sans-serif",
            weight: "600"
          },
          usePointStyle: true,
          pointStyle: "circle"
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
          color: "#64748b",
          font: { size: 11, family: "Inter, system-ui, sans-serif" }
        },
        grid: {
          color: "rgba(255, 255, 255, 0.04)"
        }
      },
      y: {
        ticks: {
          color: "#64748b",
          font: { size: 11, family: "Inter, system-ui, sans-serif" },
          callback: (value) => `${value} Mbps`
        },
        grid: {
          color: "rgba(255, 255, 255, 0.04)"
        }
      }
    },
    ...customOptions
  };

  return (
    <div className="line-chart-wrapper" style={{ width: "100%", height: height, position: "relative" }}>
      <Line data={chartData} options={defaultOptions} />
    </div>
  );
}

export default LineChart;
