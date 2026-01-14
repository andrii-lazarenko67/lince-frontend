/**
 * Chart Image Generator Component
 * Renders Chart.js charts and converts them to base64 images for PDF embedding
 * Uses offscreen canvas for server-side compatible rendering
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart } from 'react-chartjs-2';
import type { ChartSeriesData, ChartConfig, ChartType } from '../../../types';

// Register Chart.js components including annotation plugin for spec limit lines
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

export interface ChartImageGeneratorProps {
  chartSeries: ChartSeriesData;
  chartConfig: ChartConfig;
  onImageGenerated: (base64Image: string, monitoringPointId: number) => void;
  width?: number;
  height?: number;
}

/**
 * Generates a chart and converts it to base64 image for PDF embedding
 */
export const ChartImageGenerator: React.FC<ChartImageGeneratorProps> = ({
  chartSeries,
  chartConfig,
  onImageGenerated,
  width = 500,
  height = 300
}) => {
  const chartRef = useRef<ChartJS<'bar' | 'line'>>(null);
  const [isReady, setIsReady] = useState(false);

  // Build chart data
  const buildChartData = useCallback((): ChartData<'bar' | 'line', (number | null)[], string> => {
    const labels = chartSeries.data.map(d => d.label);
    const values = chartSeries.data.map(d => d.value);
    const outOfRangeFlags = chartSeries.data.map(d => d.isOutOfRange);

    // Determine chart type
    const chartType = chartConfig.chartType || 'bar';
    const primaryColor = chartSeries.color || chartConfig.colors?.primary || '#1976d2';
    const outOfRangeColor = '#dc2626'; // Red for out-of-range values

    // Convert hex color to rgba for area chart fill
    const hexToRgba = (hex: string, alpha: number): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Build datasets based on chart type
    const datasets: ChartData<'bar' | 'line', (number | null)[], string>['datasets'] = [];

    if (chartType === 'bar') {
      // Bar chart - individual bar colors based on out-of-range status
      datasets.push({
        label: `${chartSeries.parameterName} (${chartSeries.unit})`,
        data: values,
        backgroundColor: outOfRangeFlags.map(isOOR =>
          isOOR ? hexToRgba(outOfRangeColor, 0.8) : hexToRgba(primaryColor, 0.8)
        ),
        borderColor: outOfRangeFlags.map(isOOR =>
          isOOR ? outOfRangeColor : primaryColor
        ),
        borderWidth: 1,
        borderRadius: 4, // Rounded bar corners
        borderSkipped: false
      });
    } else if (chartType === 'area') {
      // Area chart - filled area under the line
      datasets.push({
        label: `${chartSeries.parameterName} (${chartSeries.unit})`,
        data: values,
        backgroundColor: hexToRgba(primaryColor, 0.3), // Semi-transparent fill
        borderColor: primaryColor,
        borderWidth: 2,
        fill: true, // Enable area fill
        tension: 0.4, // Smooth curve
        pointRadius: 4,
        pointBackgroundColor: outOfRangeFlags.map(isOOR =>
          isOOR ? outOfRangeColor : primaryColor
        ),
        pointBorderColor: outOfRangeFlags.map(isOOR =>
          isOOR ? outOfRangeColor : primaryColor
        ),
        pointBorderWidth: 2
      });
    } else {
      // Line chart
      datasets.push({
        label: `${chartSeries.parameterName} (${chartSeries.unit})`,
        data: values,
        backgroundColor: 'transparent',
        borderColor: primaryColor,
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: outOfRangeFlags.map(isOOR =>
          isOOR ? outOfRangeColor : primaryColor
        ),
        pointBorderColor: outOfRangeFlags.map(isOOR =>
          isOOR ? outOfRangeColor : primaryColor
        ),
        pointBorderWidth: 2
      });
    }

    return {
      labels,
      datasets
    };
  }, [chartSeries, chartConfig]);

  // Build chart options
  const buildChartOptions = useCallback((): ChartOptions<'bar' | 'line'> => {
    const specLimitColor = chartConfig.colors?.specLimitLine || '#dc2626';
    const textColor = chartConfig.colors?.text || '#374151';
    const gridColor = chartConfig.colors?.gridLines || '#e5e7eb';

    // Build annotation for specification limit line
    const annotations: Record<string, unknown> = {};

    if (chartSeries.showSpecLimit !== false) {
      // Add max limit line (upper specification)
      if (chartSeries.maxValue !== null) {
        annotations['maxLine'] = {
          type: 'line',
          yMin: chartSeries.maxValue,
          yMax: chartSeries.maxValue,
          borderColor: specLimitColor,
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            display: true,
            content: `Max: ${chartSeries.maxValue}`,
            position: 'end',
            backgroundColor: specLimitColor,
            color: '#ffffff',
            font: { size: 10 }
          }
        };
      }

      // Add min limit line (lower specification)
      if (chartSeries.minValue !== null) {
        annotations['minLine'] = {
          type: 'line',
          yMin: chartSeries.minValue,
          yMax: chartSeries.minValue,
          borderColor: specLimitColor,
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            display: true,
            content: `Min: ${chartSeries.minValue}`,
            position: 'end',
            backgroundColor: specLimitColor,
            color: '#ffffff',
            font: { size: 10 }
          }
        };
      }
    }

    return {
      responsive: false,
      maintainAspectRatio: false,
      animation: {
        duration: 0 // Disable animation for image generation
      },
      plugins: {
        title: {
          display: !!chartConfig.title || !!chartSeries.monitoringPointName,
          text: chartConfig.title || `${chartSeries.parameterName} (${chartSeries.unit})`,
          color: textColor,
          font: { size: 14, weight: 'bold' }
        },
        legend: {
          display: chartConfig.showLegend !== false,
          position: 'top',
          labels: { color: textColor }
        },
        tooltip: {
          enabled: false // Disable for image generation
        },
        // @ts-expect-error - annotation plugin types
        annotation: Object.keys(annotations).length > 0 ? { annotations } : undefined
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor },
          beginAtZero: true
        }
      }
    };
  }, [chartSeries, chartConfig]);

  // Convert chart to base64 image
  const generateImage = useCallback(() => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      if (canvas) {
        const base64 = canvas.toDataURL('image/png', 1.0);
        onImageGenerated(base64, chartSeries.monitoringPointId);
        setIsReady(true);
      }
    }
  }, [onImageGenerated, chartSeries.monitoringPointId]);

  // Generate image after chart renders
  useEffect(() => {
    const timer = setTimeout(() => {
      generateImage();
    }, 100); // Small delay to ensure chart is fully rendered

    return () => clearTimeout(timer);
  }, [generateImage]);

  const chartData = buildChartData();
  const chartOptions = buildChartOptions();
  const chartType: ChartType = chartConfig.chartType === 'area' ? 'line' : chartConfig.chartType || 'bar';

  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: chartConfig.colors?.background || '#ffffff'
      }}
    >
      <Chart
        ref={chartRef}
        type={chartType}
        data={chartData}
        options={chartOptions}
        width={width}
        height={height}
      />
      {isReady && <span data-testid="chart-ready" />}
    </div>
  );
};

/**
 * Component to render multiple charts and collect their images
 */
export interface ChartImageBatchGeneratorProps {
  chartSeriesList: ChartSeriesData[];
  chartConfig: ChartConfig;
  onAllImagesGenerated: (images: Map<number, string>) => void;
  width?: number;
  height?: number;
}

export const ChartImageBatchGenerator: React.FC<ChartImageBatchGeneratorProps> = ({
  chartSeriesList,
  chartConfig,
  onAllImagesGenerated,
  width = 500,
  height = 300
}) => {
  const [generatedImages, setGeneratedImages] = useState<Map<number, string>>(new Map());
  const expectedCount = chartSeriesList.length;

  const handleImageGenerated = useCallback((base64Image: string, monitoringPointId: number) => {
    setGeneratedImages(prev => {
      const newMap = new Map(prev);
      newMap.set(monitoringPointId, base64Image);
      return newMap;
    });
  }, []);

  // Call onAllImagesGenerated when all images are ready
  useEffect(() => {
    if (generatedImages.size === expectedCount && expectedCount > 0) {
      onAllImagesGenerated(generatedImages);
    }
  }, [generatedImages, expectedCount, onAllImagesGenerated]);

  if (chartSeriesList.length === 0) {
    return null;
  }

  return (
    <>
      {chartSeriesList.map(series => (
        <ChartImageGenerator
          key={series.monitoringPointId}
          chartSeries={series}
          chartConfig={chartConfig}
          onImageGenerated={handleImageGenerated}
          width={width}
          height={height}
        />
      ))}
    </>
  );
};

export default ChartImageGenerator;
