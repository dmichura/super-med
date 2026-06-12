import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'supermed-backend',
      name: 'SuperMED — System Zarządzania Szpitalem i EDM',
      timestamp: new Date().toISOString(),
    };
  }
}