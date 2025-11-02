npm install aws-cdk-lib aws-cdk
npm install -D @types/aws-cdk
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export class TicketeateDashboard extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dashboard principal
    const dashboard = new cloudwatch.Dashboard(this, 'TicketeateDashboard', {
      dashboardName: 'Ticketeate-Metrics',
    });

    // Métricas de compras
    const purchaseWidget = new cloudwatch.GraphWidget({
      title: 'Compras',
      left: [
        new cloudwatch.Metric({
          namespace: 'Ticketeate/Checkout',
          metricName: 'PurchaseCount',
          statistic: 'Sum',
          period: cdk.Duration.minutes(1),
        }),
        new cloudwatch.Metric({
          namespace: 'Ticketeate/Checkout',
          metricName: 'PurchaseAmount',
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
      ],
    });

    // Métricas de cola
    const queueWidget = new cloudwatch.GraphWidget({
      title: 'Cola de Espera',
      left: [
        new cloudwatch.Metric({
          namespace: 'Ticketeate/Events',
          metricName: 'QueueLength',
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
      ],
    });

    // Métricas de rendimiento
    const performanceWidget = new cloudwatch.GraphWidget({
      title: 'Rendimiento',
      left: [
        new cloudwatch.Metric({
          namespace: 'Ticketeate/Checkout',
          metricName: 'ProcessingTime',
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
        new cloudwatch.Metric({
          namespace: 'Ticketeate/Events',
          metricName: 'ProcessingTime',
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
      ],
    });

    // Métricas de usuarios
    const usersWidget = new cloudwatch.GraphWidget({
      title: 'Usuarios Activos',
      left: [
        new cloudwatch.Metric({
          namespace: 'Ticketeate/Events',
          metricName: 'ActiveUsers',
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
      ],
    });

    // Métricas del sistema
    const systemWidget = new cloudwatch.GraphWidget({
      title: 'Recursos del Sistema',
      left: [
        new cloudwatch.Metric({
          namespace: 'Ticketeate/System',
          metricName: 'CpuUsage',
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
        new cloudwatch.Metric({
          namespace: 'Ticketeate/System',
          metricName: 'MemoryUsage',
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
      ],
    });

    // Agregar widgets al dashboard
    dashboard.addWidgets(
      purchaseWidget,
      queueWidget,
      performanceWidget,
      usersWidget,
      systemWidget
    );

    // Alarmas
    new cloudwatch.Alarm(this, 'HighProcessingTimeAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'Ticketeate/Checkout',
        metricName: 'ProcessingTime',
        statistic: 'Average',
        period: cdk.Duration.minutes(1),
      }),
      threshold: 1000, // 1 segundo
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    new cloudwatch.Alarm(this, 'HighQueueLengthAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'Ticketeate/Events',
        metricName: 'QueueLength',
        statistic: 'Average',
        period: cdk.Duration.minutes(1),
      }),
      threshold: 1000, // 1000 personas en cola
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
  }
}