
// PERFORMANCE MONITOR & BUDGET ENFORCEMENT SYSTEM
// Monitors FPS and Memory to adaptively degrade visual quality.

import { AppSettings } from '../types';

interface PerformanceMetrics {
  fps: number;
  memoryUsed: number; // MB
  isLowPower: boolean;
  droppedFrames: number;
}

class PerformanceMonitor {
  private frames = 0;
  private lastTime = performance.now();
  private metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsed: 0,
    isLowPower: false,
    droppedFrames: 0
  };
  private listeners: ((metrics: PerformanceMetrics) => void)[] = [];
  private animationFrameId: number | null = null;
  private checkInterval: any = null;

  start() {
    this.loop();
    // Check heavy metrics less frequently (every 1s)
    this.checkInterval = setInterval(() => this.updateHeavyMetrics(), 1000);
  }

  stop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  private loop = () => {
    this.frames++;
    const now = performance.now();
    if (now >= this.lastTime + 1000) {
      this.metrics.fps = this.frames;
      this.metrics.droppedFrames = Math.max(0, 60 - this.frames);
      
      // Auto-Enforcement: Detect Low Performance
      if (this.metrics.fps < 45) {
          if (!this.metrics.isLowPower) {
              console.warn('[Performance] FPS Drop detected. Engaging Low Power optimizations.');
              this.metrics.isLowPower = true;
              this.notify();
          }
      } else if (this.metrics.fps > 55 && this.metrics.isLowPower) {
          // Recovery logic could go here
      }

      this.frames = 0;
      this.lastTime = now;
      this.notify();
    }
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateHeavyMetrics() {
    // Memory Budget Enforcement (Chrome/Edge only)
    const perf = window.performance as any;
    if (perf.memory) {
      this.metrics.memoryUsed = Math.round(perf.memory.usedJSHeapSize / 1024 / 1024);
      
      // Hard Limit: 500MB
      if (this.metrics.memoryUsed > 500) {
          console.warn('[Performance] Memory Critical. Suggesting cache clear.');
      }
    }
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.metrics));
  }

  getMetrics() {
    return this.metrics;
  }
}

export const performanceMonitor = new PerformanceMonitor();
