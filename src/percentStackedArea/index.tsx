import React, { useContext, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  PercentStackedArea as G2plotPercentStackedArea,
  PercentStackedAreaConfig as G2plotProps,
} from '@antv/g2plot';
import useChart from '../hooks/useChart';
import { ConfigContext, ErrorBoundary } from '../base';

export interface PercentStackedAreaConfig extends G2plotProps {
  chartRef?: React.MutableRefObject<G2plotPercentStackedArea | undefined>;
  chartStyle?: React.CSSProperties;
  className?: string;
}

const PercentStackedAreaChart = forwardRef((props: PercentStackedAreaConfig, ref) => {
  const config = useContext(ConfigContext);
  const { chartRef, chartStyle = {}, className, ...rest } = Object.assign(config, props);

  const { chart, container } = useChart<G2plotPercentStackedArea, PercentStackedAreaConfig>(
    G2plotPercentStackedArea,
    rest,
  );

  useEffect(() => {
    if (chartRef) {
      chartRef.current = chart.current;
    }
  }, [chart.current]);
  useImperativeHandle(ref, () => ({
    getChart: () => chart.current,
  }));
  return (
    <ErrorBoundary>
      <div className={className} style={chartStyle} ref={container} />
    </ErrorBoundary>
  );
});

PercentStackedAreaChart.defaultProps = G2plotPercentStackedArea.getDefaultOptions();

export default PercentStackedAreaChart;
