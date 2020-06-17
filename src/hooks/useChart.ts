import { ReactNode, useRef, useEffect } from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import {
  Base as G2PlotBase,
  PlotConfig as G2PlotPlotConfig,
  Tooltip as G2PlotTooltip,
  CustomTooltipConfig,
} from '@antv/g2plot';
import createNode from '../util/createNode';

export interface Tooltip extends Omit<G2PlotTooltip, 'custom'> {
  custom?: {
    container?: ReactNode;
    customContent?: (title: string, data: any[]) => ReactNode;
    onChange?: (tooltipDom: HTMLElement, cfg: CustomTooltipConfig) => void;
  };
}

export interface PlotConfig extends G2PlotPlotConfig {
  memoData?: string | number | any[];
  tooltip?: Tooltip;
  data?: any[];
  onlyChangeData?: boolean;
}

export interface Base extends G2PlotBase {
  __proto__?: any;
}

export default function useInit<T extends Base, U extends PlotConfig>(ChartClass: any, config: U) {
  const chart = useRef<T>();

  const container = useRef<HTMLDivElement>(null);

  /**
   * Get data base64
   * @param {string} type A DOMString indicating the image format. The default format type is image/png.
   * @param {number} encoderOptions A Number between 0 and 1 indicating the image quality
   */
  const toDataURL = (type = 'image/png', encoderOptions?: number) => {
    return chart.current?.canvas.cfg.el.toDataURL(type, encoderOptions);
  };

  /**
   * Download Iamge
   * @param {string} name A name of image
   * @param {string} type A DOMString indicating the image format. The default format type is image/png.
   * @param {number} encoderOptions A Number between 0 and 1 indicating the image quality
   */
  const downloadImage = (name: string, type = 'image/png', encoderOptions?: number) => {
    try {
      // default png
      if (name && name.indexOf('.') === -1) {
        name = `${name}.png`;
      }
      let imageName = name;
      if (!imageName) {
        const _config = config as any;
        // 默认值：图表 title -> 图表类型
        imageName = `${_config?.title?.text || ChartClass?.name}.png`;
      }
      const base64 = chart.current?.canvas.cfg.el.toDataURL(type, encoderOptions);
      let a: HTMLAnchorElement | null = document.createElement('a');
      a.href = base64;
      a.download = imageName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      a = null;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (chart.current) {
      if (config.onlyChangeData) {
        chart.current.changeData(config?.data || []);
      } else {
        chart.current.updateConfig(config);
        chart.current.render();
      }
    }
  }, [config?.memoData ? config.memoData : JSON.stringify(config)]);

  useEffect(() => {
    if (!container.current) {
      return () => null;
    }
    /* tooltip 支持 ReactNode */
    if (config.tooltip?.custom?.container) {
      config.tooltip.custom.container = createNode(config.tooltip.custom.container);
    }
    if (config.tooltip?.custom?.customContent) {
      const customContent = config.tooltip.custom.customContent;
      config.tooltip.custom.customContent = (title: string, items: any[]) => {
        const tooltipDom = customContent(title, items);
        if (ReactTestUtils.isElement(tooltipDom)) {
          return createNode(tooltipDom);
        }
        return tooltipDom;
      };
    }

    const chartInstance: T = new (ChartClass as any)(container.current, {
      ...config,
    });
    chart.current = chartInstance;
    chartInstance.__proto__.toDataURL = (type: string, encoderOptions?: number) => {
      return toDataURL(type, encoderOptions);
    };
    chartInstance.__proto__.downloadImage = (
      name: string,
      type: string,
      encoderOptions?: number,
    ) => {
      return downloadImage(name, type, encoderOptions);
    };
    chartInstance.render();
    return () => chartInstance.destroy();
  }, []);

  return {
    chart,
    container,
    toDataURL,
    downloadImage,
  };
}
