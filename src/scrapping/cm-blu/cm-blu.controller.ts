import { BadRequestException, Controller } from '@nestjs/common';
import { CmBluService } from './cm-blu.service';
import { ExtractedDocCmBluDto } from './dto/extracted-doc-cm-blu.dto';
import { DocCmBluTypes } from './enums/doc-cm-blu-types.enum';
import { DocCmBluSubTypes } from './enums/doc-cm-blu-sub-types.enum';

@Controller()
export class CmBluController {
  constructor(private readonly cmBluService: CmBluService) {}

  public async getMocoesByYear(year: number): Promise<ExtractedDocCmBluDto[]> {
    try {
      if (year < 1995)
        throw new BadRequestException(
          'There is no registered "moções" before 1995',
        );

      return await this.cmBluService.scrape({
        type: DocCmBluTypes.LEGISLATIVO,
        subType: DocCmBluSubTypes.PARECER,
        author: 'bruno-cunha-467',
        status: 'protocolado-1',
        year,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
