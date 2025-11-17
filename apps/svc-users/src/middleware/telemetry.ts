import { Telemetry } from '@ticketeate/telemetry';
import { CloudWatchMetrics } from '@ticketeate/telemetry/aws';

const telemetry = Telemetry.init({ serviceName: 'svc-users' });

const cloudWatch = new CloudWatchMetrics({
  region: process.env.AWS_REGION || 'us-east-1',
  namespace: 'Ticketeate/Users',
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
    try {
      await cloudWatch.recordProcessingTime(duration);
    } catch (_) {}

    try {
      await cloudWatch.recordCpuUsage(cpuPercent);
    } catch (_) {}

    try {
      await cloudWatch.recordMemoryUsage(Math.round(endMemory.heapUsed / 1024 / 1024));
    } catch (_) {}
  }
};
