import { Injectable } from '@nestjs/common';

@Injectable()
export class ScrappingStandardizeService {
  public static stringStandardize(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '')
      .toUpperCase();
  }
}
