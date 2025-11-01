import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

export interface CloudWatchConfig {
  region: string;
  namespace: string;
}

export class CloudWatchMetrics {
  private client: CloudWatchClient;
  private readonly namespace: string;

  constructor(config: CloudWatchConfig) {
    this.client = new CloudWatchClient({ region: config.region });
    this.namespace = config.namespace;
  }

  async putMetricData(metricName: string, value: number, unit: string, dimensions?: Record<string, string>) {
    const command = new PutMetricDataCommand({
      Namespace: this.namespace,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Dimensions: dimensions 
            ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value }))
            : undefined,
          Timestamp: new Date(),
        },
      ],
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error putting metric data to CloudWatch:', error);
      throw error;
    }
  }

  // Métodos de utilidad para métricas específicas
  async recordPurchase(amount: number) {
    await this.putMetricData('PurchaseCount', 1, 'Count');
    await this.putMetricData('PurchaseAmount', amount, 'None');
  }

  async recordQueueLength(length: number) {
    await this.putMetricData('QueueLength', length, 'Count');
  }

  async recordProcessingTime(milliseconds: number) {
    await this.putMetricData('ProcessingTime', milliseconds, 'Milliseconds');
  }

  async recordActiveUsers(count: number) {
    await this.putMetricData('ActiveUsers', count, 'Count');
  }

  // Métricas del sistema
  async recordCpuUsage(percentage: number) {
    await this.putMetricData('CpuUsage', percentage, 'Percent');
  }

  async recordMemoryUsage(megabytes: number) {
    await this.putMetricData('MemoryUsage', megabytes, 'Megabytes');
  }
}