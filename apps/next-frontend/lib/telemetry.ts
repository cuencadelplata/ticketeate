import { Telemetry } from '@ticketeate/telemetry';

// Inicializa la telemetría para el servidor Next (sólo en runtime servidor)
const telemetry = Telemetry.init({ serviceName: 'next-frontend' });

export default telemetry;
