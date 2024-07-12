import { Protocol } from 'lampros-router';

export const TO_PROTOCOL = (protocol: string): Protocol => {
  switch (protocol.toLowerCase()) {
    case 'v3':
      return Protocol.V3;
    default:
      throw new Error(`Unknown protocol: {id}`);
  }
};
