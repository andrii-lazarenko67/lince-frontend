/**
 * Chart to Image Utility
 * Converts charts to images for PDF embedding
 * Used by the report PDF generator to include charts
 */

export interface ChartImageOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  devicePixelRatio?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string | string[];
    backgroundColor?: string | string[];
    fill?: boolean;
  }>;
}

/**
 * Renders chart data to a canvas and returns it as a data URL
 * This is a simple implementation for basic line/bar charts
 */
export function renderChartToImage(
  data: ChartData,
  type: 'line' | 'bar' = 'line',
  options: ChartImageOptions = {}
): string {
  const {
    width = 400,
    height = 200,
    backgroundColor = '#ffffff',
    devicePixelRatio = 2
  } = options;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Scale for high DPI
  ctx.scale(devicePixelRatio, devicePixelRatio);

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Chart dimensions
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate data bounds
  const allValues = data.datasets.flatMap(d => d.data);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  // Draw axes
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;

  // Y axis
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // X axis
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  // Draw grid lines
  ctx.strokeStyle = '#f3f4f6';
  ctx.setLineDash([2, 2]);
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartHeight / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Draw labels
  ctx.fillStyle = '#6b7280';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';

  // X axis labels
  const labelStep = Math.ceil(data.labels.length / 10);
  data.labels.forEach((label, i) => {
    if (i % labelStep === 0) {
      const x = padding.left + (chartWidth / (data.labels.length - 1)) * i;
      ctx.fillText(label, x, height - padding.bottom + 15);
    }
  });

  // Y axis labels
  ctx.textAlign = 'right';
  for (let i = 0; i <= gridLines; i++) {
    const value = maxValue - (valueRange / gridLines) * i;
    const y = padding.top + (chartHeight / gridLines) * i + 4;
    ctx.fillText(value.toFixed(1), padding.left - 5, y);
  }

  // Draw datasets
  data.datasets.forEach((dataset, datasetIndex) => {
    // Handle color which can be string or string[] - use first value for line charts
    const borderColorRaw = dataset.borderColor;
    const bgColorRaw = dataset.backgroundColor;
    const color = typeof borderColorRaw === 'string' ? borderColorRaw :
      (Array.isArray(borderColorRaw) ? borderColorRaw[0] : undefined) || getDefaultColor(datasetIndex);
    const bgColor = typeof bgColorRaw === 'string' ? bgColorRaw :
      (Array.isArray(bgColorRaw) ? bgColorRaw[0] : undefined) || hexToRgba(color, 0.2);

    if (type === 'line') {
      drawLineChart(ctx, dataset.data, {
        padding,
        chartWidth,
        chartHeight,
        minValue,
        valueRange,
        color,
        bgColor,
        fill: dataset.fill
      });
    } else {
      drawBarChart(ctx, dataset.data, {
        padding,
        chartWidth,
        chartHeight,
        minValue,
        valueRange,
        color,
        bgColor,
        datasetIndex,
        totalDatasets: data.datasets.length
      });
    }
  });

  // Draw legend
  if (data.datasets.length > 1) {
    const legendY = 10;
    let legendX = padding.left;

    ctx.textAlign = 'left';
    data.datasets.forEach((dataset, i) => {
      const borderColorRaw = dataset.borderColor;
      const color = typeof borderColorRaw === 'string' ? borderColorRaw :
        (Array.isArray(borderColorRaw) ? borderColorRaw[0] : undefined) || getDefaultColor(i);
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 10, 10);
      ctx.fillStyle = '#374151';
      ctx.fillText(dataset.label, legendX + 15, legendY + 8);
      legendX += ctx.measureText(dataset.label).width + 30;
    });
  }

  return canvas.toDataURL('image/png');
}

interface DrawOptions {
  padding: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  minValue: number;
  valueRange: number;
  color: string;
  bgColor: string;
}

interface LineDrawOptions extends DrawOptions {
  fill?: boolean;
}

function drawLineChart(
  ctx: CanvasRenderingContext2D,
  data: number[],
  options: LineDrawOptions
): void {
  const { padding, chartWidth, chartHeight, minValue, valueRange, color, bgColor, fill } = options;

  const points: Array<{ x: number; y: number }> = data.map((value, i) => ({
    x: padding.left + (chartWidth / (data.length - 1)) * i,
    y: padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight
  }));

  // Draw fill
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = bgColor;
    ctx.fill();
  }

  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  // Draw points
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

interface BarDrawOptions extends DrawOptions {
  datasetIndex: number;
  totalDatasets: number;
}

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  data: number[],
  options: BarDrawOptions
): void {
  const {
    padding,
    chartWidth,
    chartHeight,
    minValue,
    valueRange,
    color,
    bgColor,
    datasetIndex,
    totalDatasets
  } = options;

  const barGroupWidth = chartWidth / data.length;
  const barWidth = (barGroupWidth * 0.8) / totalDatasets;
  const barOffset = datasetIndex * barWidth;

  data.forEach((value, i) => {
    const x = padding.left + barGroupWidth * i + barGroupWidth * 0.1 + barOffset;
    const barHeight = ((value - minValue) / valueRange) * chartHeight;
    const y = padding.top + chartHeight - barHeight;

    // Draw bar
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, barWidth - 2, barHeight);

    // Draw border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth - 2, barHeight);
  });
}

/**
 * Get default color by index
 */
function getDefaultColor(index: number): string {
  const colors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316'  // Orange
  ];
  return colors[index % colors.length];
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(59, 130, 246, ${alpha})`;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create a simple line chart from daily log data
 */
export function createDailyLogChart(
  entries: Array<{
    date: string;
    value: number;
    isOutOfRange?: boolean;
    minValue?: number;
    maxValue?: number;
  }>,
  label: string
): string {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data: ChartData = {
    labels: sortedEntries.map(e =>
      new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      label,
      data: sortedEntries.map(e => e.value),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    }]
  };

  return renderChartToImage(data, 'line');
}

/**
 * Create a bar chart for summary statistics
 */
export function createSummaryChart(
  data: Array<{ label: string; value: number; color?: string }>
): string {
  const chartData: ChartData = {
    labels: data.map(d => d.label),
    datasets: [{
      label: 'Summary',
      data: data.map(d => d.value),
      borderColor: data.map(d => d.color || '#3b82f6'),
      backgroundColor: data.map(d => hexToRgba(d.color || '#3b82f6', 0.6))
    }]
  };

  return renderChartToImage(chartData, 'bar', { height: 250 });
}

/**
 * Create a status distribution pie chart (rendered as horizontal bar)
 */
export function createStatusChart(
  statuses: Array<{ status: string; count: number; color: string }>
): string {
  const total = statuses.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return '';

  const canvas = document.createElement('canvas');
  const width = 400;
  const height = 60;
  canvas.width = width * 2;
  canvas.height = height * 2;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.scale(2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  let currentX = 0;
  const barY = 10;
  const barHeight = 20;
  const barWidth = width - 20;

  statuses.forEach(status => {
    const segmentWidth = (status.count / total) * barWidth;
    ctx.fillStyle = status.color;
    ctx.fillRect(10 + currentX, barY, segmentWidth, barHeight);
    currentX += segmentWidth;
  });

  // Draw legend
  let legendX = 10;
  const legendY = 45;
  ctx.font = '10px sans-serif';

  statuses.forEach(status => {
    ctx.fillStyle = status.color;
    ctx.fillRect(legendX, legendY - 8, 10, 10);
    ctx.fillStyle = '#374151';
    ctx.fillText(`${status.status} (${status.count})`, legendX + 15, legendY);
    legendX += ctx.measureText(`${status.status} (${status.count})`).width + 30;
  });

  return canvas.toDataURL('image/png');
}

export default {
  renderChartToImage,
  createDailyLogChart,
  createSummaryChart,
  createStatusChart
};
