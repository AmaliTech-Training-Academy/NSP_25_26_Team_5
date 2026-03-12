import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";
import type {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  ChartTypeRegistry,
  Plugin,
  TooltipItem,
  TooltipModel,
} from "chart.js";
import styles from "./AnalyticsBarChart.module.css";

type AnalyticsBarChartVariant = "category" | "weekday";

interface AnalyticsBarChartProps {
  labels: string[];
  values: number[];
  ariaLabel: string;
  variant?: AnalyticsBarChartVariant;
}

function findSuggestedMax(values: number[]): number {
  const highestValue = Math.max(...values, 0);

  if (highestValue <= 4) {
    return 4;
  }

  return Math.ceil(highestValue / 4) * 4;
}

function splitWord(word: string, maxLineLength: number): string[] {
  if (word.length <= maxLineLength) {
    return [word];
  }

  const parts: string[] = [];

  for (let index = 0; index < word.length; index += maxLineLength) {
    parts.push(word.slice(index, index + maxLineLength));
  }

  return parts;
}

function wrapCategoryLabel(label: string, maxLineLength: number): string | string[] {
  const segments = label
    .split(/\s+/)
    .flatMap((word) => splitWord(word, maxLineLength));
  const lines: string[] = [];
  let currentLine = "";

  segments.forEach((segment) => {
    if (!currentLine) {
      currentLine = segment;
      return;
    }

    const nextLine = `${currentLine} ${segment}`;

    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = segment;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 1 ? lines : label;
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
    ctx.lineWidth = 1;
    const numericTicks = yScale.ticks
      .map((tick) => Number(tick.value))
      .filter((value) => !Number.isNaN(value));
    const highestTick = numericTicks[numericTicks.length - 1] ?? 0;
    const averageLineValue = highestTick > 0 ? highestTick / 2 : null;

    yScale.ticks.forEach((tick, index) => {
      const numericValue = Number(tick.value);
      if (Number.isNaN(numericValue) || numericValue === 0) {
        return;
      }

      const y = yScale.getPixelForTick(index);
      const isAverageLine =
        averageLineValue !== null &&
        Math.abs(numericValue - averageLineValue) < 0.001;

      ctx.setLineDash(isAverageLine ? [4, 4] : [3, 4]);
      ctx.strokeStyle = isAverageLine ? "rgba(57, 60, 201, 0.65)" : "rgba(8, 40, 59, 0.16)";

      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();
    });

    ctx.restore();
  },
};

function getOrCreateTooltip(chart: ChartJS): HTMLDivElement | null {
  const parent = chart.canvas.parentNode;

  if (!(parent instanceof HTMLDivElement)) {
    return null;
  }

  let tooltipEl = parent.querySelector<HTMLDivElement>("[data-analytics-tooltip]");

  if (tooltipEl) {
    return tooltipEl;
  }

  tooltipEl = document.createElement("div");
  tooltipEl.dataset.analyticsTooltip = "true";
  tooltipEl.className = styles.tooltip;

  const content = document.createElement("div");
  content.dataset.analyticsTooltipContent = "true";
  content.className = styles.tooltipContent;
  tooltipEl.appendChild(content);

  parent.appendChild(tooltipEl);

  return tooltipEl;
}

function renderExternalTooltip(
  chart: ChartJS,
  tooltip: TooltipModel<keyof ChartTypeRegistry>,
) {
  const tooltipEl = getOrCreateTooltip(chart);

  if (!tooltipEl) {
    return;
  }

  if (tooltip.opacity === 0) {
    tooltipEl.classList.remove(styles.tooltipVisible);
    return;
  }

  const contentEl = tooltipEl.querySelector<HTMLDivElement>(
    "[data-analytics-tooltip-content]",
  );
  const bodyLines = tooltip.body?.flatMap((bodyItem) => bodyItem.lines) ?? [];

  if (contentEl) {
    contentEl.textContent = bodyLines.join(" ");
  }

  tooltipEl.style.left = `${chart.canvas.offsetLeft + tooltip.caretX}px`;
  tooltipEl.style.top = `${chart.canvas.offsetTop + tooltip.caretY}px`;
  tooltipEl.classList.add(styles.tooltipVisible);
}

export default function AnalyticsBarChart({
  labels,
  values,
  ariaLabel,
  variant = "weekday",
}: AnalyticsBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const suggestedMax = useMemo(() => findSuggestedMax(values), [values]);
  const stepSize = Math.max(1, Math.ceil(suggestedMax / 4));
  const chartFrameClassName =
    variant === "category"
      ? `${styles.chartFrame} ${styles.chartFrameCategory}`
      : `${styles.chartFrame} ${styles.chartFrameWeekday}`;

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const isDesktopViewport = window.matchMedia("(min-width: 768px)").matches;
    const chartLabels =
      variant === "category"
        ? labels.map((label) => wrapCategoryLabel(label, isDesktopViewport ? 13 : 6))
        : labels;
    const maxBarThickness =
      variant === "category"
        ? isDesktopViewport
          ? 74
          : 54
        : isDesktopViewport
          ? 50
          : 30;

    const chartData: ChartData<"bar", number[], string | string[]> = {
      labels: chartLabels,
      datasets: [
        {
          data: values,
          backgroundColor: "#395362",
          borderRadius: 0,
          borderSkipped: false,
          hoverBackgroundColor: "#2b4351",
          categoryPercentage: 0.9,
          barPercentage: 0.87,
          maxBarThickness,
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
          enabled: false,
          external(context) {
            renderExternalTooltip(context.chart, context.tooltip);
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
            display: true,
            color: "rgba(8, 40, 59, 0.16)",
            width: 1,
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
            padding: 10,
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
            padding: 8,
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
  }, [labels, suggestedMax, stepSize, values, variant]);

  return (
    <div className={chartFrameClassName}>
      <canvas ref={canvasRef} aria-label={ariaLabel} role="img" />
    </div>
  );
}
