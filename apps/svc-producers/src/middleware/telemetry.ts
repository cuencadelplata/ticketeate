import { Telemetry } from '@ticketeate/telemetry';
import { CloudWatchMetrics } from '@ticketeate/telemetry/aws';

const telemetry = Telemetry.init({ serviceName: 'svc-producers' });

const cloudWatch = new CloudWatchMetrics({
  region: process.env.AWS_REGION || 'us-east-1',
  namespace: 'Ticketeate/Producers',
});

export const telemetryMiddleware = async (c, next) => {
  const start = Date.now();
  const startCpu = process.cpuUsage();

  try {
    await next();
  } finally {
    const duration = Date.now() - start;
    const endCpu = process.cpuUsage(startCpu);
    const endMemory = process.memoryUsage();
    const cpuMicros = endCpu.user + endCpu.system;
    const cpuPercent = Math.round((cpuMicros / (duration * 1000)) * 100);

    telemetry.recordProcessingTime(duration);
    if (process.env.ENABLE_CLOUDWATCH === 'true') {
      try {
        await cloudWatch.recordProcessingTime(duration);
      } catch (err) {
        console.error('CloudWatch recordProcessingTime error', err);
      }

      try {
        await cloudWatch.recordCpuUsage(cpuPercent);
      } catch (err) {
        console.error('CloudWatch recordCpuUsage error', err);
      }

      try {
        await cloudWatch.recordMemoryUsage(Math.round(endMemory.heapUsed / 1024 / 1024));
      } catch (err) {
        console.error('CloudWatch recordMemoryUsage error', err);
      }
    }
  }
};
