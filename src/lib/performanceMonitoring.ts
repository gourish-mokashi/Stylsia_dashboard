/**
 * Performance monitoring utilities for image optimization
 * Use these tools to measure the impact of optimizations
 */

interface ImagePerformanceMetrics {
  url: string;
  loadTime: number;
  fileSize: number;
  isLazyLoaded: boolean;
  format: string;
  dimensions: { width: number; height: number };
}

interface PerformanceData {
  lcp: number;
  cls: number;
  fid: number;
  imageMetrics: ImagePerformanceMetrics[];
  totalImageSize: number;
  averageImageLoadTime: number;
}

/**
 * Monitor image loading performance
 */
export class ImagePerformanceMonitor {
  private metrics: ImagePerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.monitorImages();
  }

  private initializeObserver() {
    // Monitor LCP
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcpEntry = entry as any;
            if (lcpEntry.element?.tagName === 'IMG') {
              console.log('LCP Image Details:', {
                url: lcpEntry.element.src,
                loadTime: lcpEntry.startTime,
                isLazyLoaded: lcpEntry.element.loading === 'lazy',
                fetchPriority: lcpEntry.element.fetchPriority
              });
            }
          }
        });
      });

      this.observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }
  }

  private monitorImages() {
    // Monitor all image loads
    const self = this;

    // Store the original constructor with proper typing
    const ImageConstructor = window.Image;
    
    // Replace with a proxy that monitors image loads
    (window as any).Image = class extends ImageConstructor {
      constructor(width?: number, height?: number) {
        super(width, height);
        const startTime = performance.now();

        this.addEventListener('load', function(this: HTMLImageElement) {
          const loadTime = performance.now() - startTime;
          self.recordImageMetric({
            url: this.src,
            loadTime,
            fileSize: 0, // Would need server support to get actual size
            isLazyLoaded: this.loading === 'lazy',
            format: self.getImageFormat(this.src),
            dimensions: {
              width: this.naturalWidth,
              height: this.naturalHeight
            }
          });
        });
      }
    };
  }

  private getImageFormat(url: string): string {
    if (url.includes('fm=webp') || url.includes('.webp')) return 'webp';
    if (url.includes('fm=avif') || url.includes('.avif')) return 'avif';
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpeg';
    if (url.includes('.png')) return 'png';
    return 'unknown';
  }

  private recordImageMetric(metric: ImagePerformanceMetrics) {
    this.metrics.push(metric);
    console.log('Image loaded:', metric);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): PerformanceData {
    const totalImageSize = this.metrics.reduce((sum, m) => sum + m.fileSize, 0);
    const averageImageLoadTime = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length 
      : 0;

    return {
      lcp: this.getLCP(),
      cls: this.getCLS(),
      fid: this.getFID(),
      imageMetrics: this.metrics,
      totalImageSize,
      averageImageLoadTime
    };
  }

  private getLCP(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }) as any;
  }

  private getCLS(): number {
    return new Promise((resolve) => {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        resolve(clsValue);
      }).observe({ type: 'layout-shift', buffered: true });
    }) as any;
  }

  private getFID(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          resolve((entry as any).processingStart - entry.startTime);
        }
      }).observe({ type: 'first-input', buffered: true });
    }) as any;
  }

  /**
   * Analyze lazy loading effectiveness
   */
  analyzeLazyLoading() {
    const lazyImages = this.metrics.filter(m => m.isLazyLoaded);
    const eagerImages = this.metrics.filter(m => !m.isLazyLoaded);

    console.log('Lazy Loading Analysis:', {
      totalImages: this.metrics.length,
      lazyLoadedCount: lazyImages.length,
      eagerLoadedCount: eagerImages.length,
      averageLazyLoadTime: lazyImages.reduce((sum, m) => sum + m.loadTime, 0) / lazyImages.length,
      averageEagerLoadTime: eagerImages.reduce((sum, m) => sum + m.loadTime, 0) / eagerImages.length
    });
  }

  /**
   * Check for images that should be optimized
   */
  findOptimizationOpportunities() {
    const opportunities = this.metrics.filter(metric => {
      return (
        metric.loadTime > 1000 || // Takes more than 1 second to load
        metric.dimensions.width > 800 || // Larger than needed
        metric.format === 'jpeg' || metric.format === 'png' // Could use WebP
      );
    });

    console.log('Optimization Opportunities:', opportunities);
    return opportunities;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const summary = this.getPerformanceSummary();
    
    return `
# Image Performance Report

## Core Web Vitals
- **LCP**: ${summary.lcp.toFixed(2)}ms
- **CLS**: ${summary.cls.toFixed(3)}
- **FID**: ${summary.fid.toFixed(2)}ms

## Image Statistics
- **Total Images**: ${summary.imageMetrics.length}
- **Average Load Time**: ${summary.averageImageLoadTime.toFixed(2)}ms
- **Total Image Size**: ${(summary.totalImageSize / 1024 / 1024).toFixed(2)}MB

## Format Distribution
${this.getFormatDistribution()}

## Lazy Loading Effectiveness
${this.getLazyLoadingStats()}

## Recommendations
${this.getRecommendations()}
    `;
  }

  private getFormatDistribution(): string {
    const formats = this.metrics.reduce((acc, m) => {
      acc[m.format] = (acc[m.format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(formats)
      .map(([format, count]) => `- **${format.toUpperCase()}**: ${count} images`)
      .join('\n');
  }

  private getLazyLoadingStats(): string {
    const lazy = this.metrics.filter(m => m.isLazyLoaded).length;
    const eager = this.metrics.filter(m => !m.isLazyLoaded).length;
    
    return `
- **Lazy Loaded**: ${lazy} images
- **Eager Loaded**: ${eager} images
- **Ratio**: ${((lazy / this.metrics.length) * 100).toFixed(1)}% lazy loaded
    `;
  }

  private getRecommendations(): string {
    const opportunities = this.findOptimizationOpportunities();
    
    if (opportunities.length === 0) {
      return "✅ All images are well optimized!";
    }

    return `
⚠️ Found ${opportunities.length} optimization opportunities:
${opportunities.map(o => `- ${o.url}: ${o.loadTime.toFixed(2)}ms load time`).join('\n')}
    `;
  }

  /**
   * Clean up observers
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Initialize performance monitoring (call this in your app)
 */
export const initializeImagePerformanceMonitoring = (): ImagePerformanceMonitor => {
  if (process.env.NODE_ENV === 'development') {
    return new ImagePerformanceMonitor();
  }
  return null as any;
};

/**
 * Quick performance check function for console
 */
export const checkImagePerformance = () => {
  const monitor = new ImagePerformanceMonitor();
  
  setTimeout(() => {
    console.log(monitor.generateReport());
    monitor.analyzeLazyLoading();
    monitor.findOptimizationOpportunities();
  }, 5000); // Wait 5 seconds for images to load
  
  return monitor;
};
