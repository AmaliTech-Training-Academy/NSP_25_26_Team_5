import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";
import type {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Plugin,
  TooltipItem,
} from "chart.js";
import styles from "./AnalyticsBarChart.module.css";

interface AnalyticsBarChartProps {
  labels: string[];
  values: number[];
  ariaLabel: string;
}

function findSuggestedMax(values: number[]): number {
  const highestValue = Math.max(...values, 0);

  if (highestValue <= 4) {
    return 4;
  }

  return Math.ceil(highestValue / 4) * 4;
}

const dashedGridPlugin: Plugin<"bar"> = {
  id: "analyticsDashedGrid",
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const yScale = scales.y;

    if (!chartArea || !yScale) {
      return;
    }

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(8, 40, 59, 0.16)";

    yScale.ticks.forEach((tick, index) => {
      const numericValue = Number(tick.value);
      if (Number.isNaN(numericValue) || numericValue === 0) {
        return;
      }

      const y = yScale.getPixelForTick(index);

      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();
    });

    ctx.restore();
  },
};

export default function AnalyticsBarChart({
  labels,
  values,
  ariaLabel,
}: AnalyticsBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const suggestedMax = useMemo(() => findSuggestedMax(values), [values]);
  const stepSize = Math.max(1, Math.ceil(suggestedMax / 4));

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const chartData: ChartData<"bar"> = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: "#395362",
          borderRadius: 0,
          borderSkipped: false,
          hoverBackgroundColor: "#08283b",
          categoryPercentage: 0.74,
          barPercentage: 0.88,
          maxBarThickness: 36,
        },
      ],
    };

    const chartOptions: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          displayColors: false,
          backgroundColor: "#08283b",
          caretSize: 0,
          cornerRadius: 6,
          padding: {
            top: 6,
            right: 12,
            bottom: 6,
            left: 12,
          },
          bodyFont: {
            family: "Inter",
            size: 12,
            weight: 500,
          },
          callbacks: {
            label(context: TooltipItem<"bar">) {
              return `Count: ${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            autoSkip: false,
            color: "#5a6f7c",
            font: {
              family: "Inter",
              size: 12,
              weight: 500,
            },
            maxRotation: 0,
            minRotation: 0,
            padding: 8,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax,
          ticks: {
            color: "#5a6f7c",
            precision: 0,
            stepSize,
            font: {
              family: "Inter",
              size: 12,
              weight: 500,
            },
          },
          border: {
            display: false,
          },
          grid: {
            display: false,
          },
        },
      },
    };

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: chartData,
      options: chartOptions,
      plugins: [dashedGridPlugin],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, suggestedMax, stepSize, values]);

  return (
    <div className={styles.chartFrame}>
      <canvas ref={canvasRef} aria-label={ariaLabel} role="img" />
    </div>
  );
}
