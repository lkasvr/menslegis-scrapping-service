import { Controller } from '@nestjs/common';
import { CmBluService } from './cm-blu.service';
import { ExtractedDocCmBluDto } from './dto/extracted-doc-cm-blu.dto';

@Controller()
export class CmBluController {
  constructor(private readonly cmBluService: CmBluService) {}

  public async getMotions(url: string): Promise<ExtractedDocCmBluDto[]> {
    return await this.cmBluService.scrape(url);
  }
}
