import { Injectable } from '@nestjs/common';
import { Proposition } from '../../api-interface/interfaces';
import { ExtractedDocCmBluDto } from '../dto/extracted-doc-cm-blu.dto';

@Injectable()
export class CmBluDocFormatterService {
  public toProposition(docCmBlu: ExtractedDocCmBluDto): Proposition {
    const {
      type,
      subType,
      doc,
      date,
      authors,
      status,
      ementa,
      propositionPageLink,
    } = docCmBlu;

    const [day, month, year] = date.split('/');

    return {
      name: doc.title,
      description: ementa,
      status,
      type,
      subType,
      docLink: propositionPageLink,
      docDate: `${year}-${month}-${day}`,
      politicalBodyId: process.env.CMB_POLITICAL_BODY_ID,
      politicalBodyName: process.env.CMB_POLITICAL_BODY_NAME,
      authors: authors.map((author) => {
        return { name: author };
      }),
    };
  }
}
