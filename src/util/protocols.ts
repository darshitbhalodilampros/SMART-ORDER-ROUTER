import { Protocol } from 'lampros-router';

export const TO_PROTOCOL = (protocol: string): Protocol => {
  switch (protocol.toLowerCase()) {
    case 'v3':
      return Protocol.V3;
    // case 'v1':
    //   return Protocol.V1;
    // case 'mixed':
    //   return Protocol.MIXED;
    default:
      throw new Error(`Unknown protocol: {id}`);
  }
};
