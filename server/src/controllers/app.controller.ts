import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('.well-known/powersync')
  getWellKnown() {
    return {
      api: {
        endpoint: '/api',
      },
    };
  }
}
