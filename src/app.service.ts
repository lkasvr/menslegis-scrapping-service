import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public async sendCmBluProposition() {
    return 'Hello World!';
  }
}
