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

export default function TemperatureChart({ data, height = 200 }) {

    const chartLabels = data.map((d, index) => d.time || `Point ${index + 1}`);

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: "Temp Air ne hyrje",
                data: data.map(d => d.tempAirSupply),
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 10,
                pointHoverRadius: 12,
                pointBackgroundColor: "red",
                pointBorderColor: "white",
                pointBorderWidth: 2,
            },
            {
                label: "Temp Air ne kthim",
                data: data.map(d => d.tempReturn),
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 10,
                pointHoverRadius: 12,
                pointBackgroundColor: "blue",
                pointBorderColor: "white",
                pointBorderWidth: 2,
            },
            {
                label: "Temp ujit hyrje",
                data: data.map(d => d.tempWaterIn),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 10,
                pointHoverRadius: 12,
                pointBackgroundColor: "green",
                pointBorderColor: "white",
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 0 },
        plugins: {
            legend: {
                position: "top",
                labels: { font: { size: 14 }, color: "#333" },
            },
            title: {
                display: true,
                text: "Temperatura UTA",
                font: { size: 16, weight: "bold" },
                color: "#111",
            },
            tooltip: {
                enabled: true,
                backgroundColor: "#222",
                titleColor: "#fff",
                bodyColor: "#fff",
                cornerRadius: 5,
                mode: "index",
                intersect: false,
            },
        },
        interaction: {
            mode: "nearest",
            intersect: false,
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Data dhe Ora",
                    font: { size: 14, weight: "bold" },
                    color: "#333",
                },
                grid: { color: "#eee" },
                ticks: { font: { size: 12 }, color: "#333" },
            },
            y: {
                title: {
                    display: true,
                    text: "Temperature (°C)",
                    font: { size: 14, weight: "bold" },
                    color: "#333",
                },
                grid: { color: "#eee" },
                ticks: { font: { size: 12 }, color: "#333" },
                suggestedMin: 15,
                suggestedMax: 40,
            },
        },
    };

    return (
        <div style={{ width: "100%", height: `${height}px`, margin: 0, padding: 0 }}>
            <Line
                key={data.map(d => d.id).join("-")}
                data={chartData}
                options={options}
            />
        </div>
    );
}