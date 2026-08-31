import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart() {
  const data = {
    labels: ["Malware", "Phishing", "DDoS", "Unknown"],
    datasets: [
      {
        label: "Threats",
        data: [30, 20, 25, 25],
        backgroundColor: [
          "#00f5ff",
          "#ff4d4d",
          "#ffd700",
          "#00ff9c"
        ],
        borderColor: "#111",
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
    }
  };

  return <Pie data={data} options={options} key="pie-static" />;
}

export default PieChart;
