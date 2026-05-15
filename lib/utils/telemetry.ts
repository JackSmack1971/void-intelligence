/**
 * Simple telemetry wrapper for tracking stage latency and estimated token usage.
 */
export class Telemetry {
  private static startTime: number = 0;

  static start() {
    this.startTime = Date.now();
  }

  static logStage(stageName: string, metadata: { tokens?: number; [key: string]: any } = {}) {
    const duration = Date.now() - this.startTime;
    console.log(`[Telemetry] [${stageName}] Duration: ${duration}ms`, metadata);
    this.startTime = Date.now(); // Reset for next stage
  }

  static logMetric(name: string, value: any) {
    console.log(`[Telemetry] [Metric] ${name}:`, value);
  }
}
