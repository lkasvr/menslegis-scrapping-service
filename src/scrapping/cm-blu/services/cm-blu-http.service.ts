import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Proposition } from '../../api-interface/interfaces';

@Injectable()
export class CmBluHttpService {
  constructor(private readonly httpService: HttpService) {}

  async putPropositions(payload: Proposition[]) {
    console.info('[START REQUISITIONS]');
    const url = 'http://localhost:3000/deed';
    const result = payload.map(async (proposition, i) => {
      console.info(`[SEND REQ (${i + 1})]`);
      console.info('[URL]', url, '[BODY]', proposition);
      try {
        const result = await this.httpService.axiosRef.put(url, proposition);
        return result;
      } catch (error) {
        // Lide com o erro aqui
        if (error.response && error.response.status === 400)
          console.error(
            `REQUEST ERROR (Registro: ${i + 1})`,
            error.response.data,
          );
      }
    });
    return result;
  }
}
