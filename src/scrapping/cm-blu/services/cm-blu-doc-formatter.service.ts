import { Injectable } from '@nestjs/common';
import { Proposition } from '../../api-interface/interfaces';
import { ExtractedDocCmBluDto } from '../dto/extracted-doc-cm-blu.dto';

@Injectable()
export class CmBluDocFormatterService {
  public toProposition(docCmBlu: ExtractedDocCmBluDto): Proposition {
    const {
      type,
      subtype,
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
      status: CmBluDocFormatterService.formatPropositionStatus(status),
      type,
      subtype,
      pageDocLink: propositionPageLink,
      docLink: doc.link,
      docDate: `${year}-${month}-${day}`,
      politicalBodyName: process.env.CMB_POLITICAL_BODY_NAME,
      authors: authors.map((author) => {
        return { name: author };
      }),
    };
  }

  static formatPropositionStatus(str: string) {
    // Remover data no formato DD/MM/AAAA
    const strWithoutData = str.replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '');
    const strWithoutBlankSpaces = strWithoutData.replace(/\s/g, '');
    const strWithoutem = strWithoutBlankSpaces.replace(/em$/g, '');

    return strWithoutem.toLowerCase();
  }
}
