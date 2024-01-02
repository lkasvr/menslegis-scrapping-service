import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Proposition } from '../../api-interface/interfaces';

@Injectable()
export class CmBluHttpService {
  constructor(private readonly httpService: HttpService) {}

  async propositionPost(payload: Proposition): Promise<Proposition> {
    try {
      const { data } = await this.httpService.axiosRef.post(
        `http://localhost:3000/cmblu/proposition`,
        payload,
      );
      console.log(data);
      return data;
    } catch (erro) {
      // Lide com o erro aqui
      throw erro;
    }
  }
}
