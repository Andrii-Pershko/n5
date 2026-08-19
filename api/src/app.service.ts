import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return { ok: true, service: 'n5deal-api' };
  }
}
