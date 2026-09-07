import React from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "./PieChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const DEFAULT_THREAT_DATA = {
  labels: ["Malware", "Phishing", "DDoS", "Port Scanning", "Unknown"],
  datasets: [
    {
      label: "Detected Threats",
      data: [35, 22, 18, 15, 10],
      backgroundColor: [
        "rgba(0, 245, 255, 0.85)",   // Cyan
        "rgba(248, 113, 113, 0.85)", // Red
        "rgba(251, 191, 36, 0.85)",  // Amber
        "rgba(168, 85, 247, 0.85)",  // Purple
        "rgba(52, 211, 153, 0.85)"   // Emerald
      ],
      borderColor: "#0f172a",
      borderWidth: 2,
      hoverOffset: 6
    }
  ]
};

function PieChart({ data, title, height = "100%", useDoughnut = true, options: customOptions }) {
  // Normalize incoming data format
  let chartData = DEFAULT_THREAT_DATA;

  if (data) {
    if (data.labels && data.datasets) {
      chartData = data;
    } else if (data.labels && data.values) {
      chartData = {
        labels: data.labels,
        datasets: [
          {
            label: title || "Threat Distribution",
            data: data.values,
            backgroundColor: [
              "rgba(0, 245, 255, 0.85)",
              "rgba(248, 113, 113, 0.85)",
              "rgba(251, 191, 36, 0.85)",
              "rgba(168, 85, 247, 0.85)",
              "rgba(52, 211, 153, 0.85)",
              "rgba(56, 189, 248, 0.85)"
            ],
            borderColor: "#0f172a",
            borderWidth: 2,
            hoverOffset: 6
          }
        ]
      };
    }
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: useDoughnut ? "68%" : "0%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8",
          padding: 14,
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
    ...customOptions
  };

  const ChartComponent = useDoughnut ? Doughnut : Pie;

  return (
    <div className="pie-chart-wrapper" style={{ width: "100%", height: height, position: "relative" }}>
      <ChartComponent data={chartData} options={defaultOptions} />
    </div>
  );
}

export default PieChart;
