import { Injectable } from '@nestjs/common';
import { Proposition } from './api-interface/interfaces';
import { ExtractedDocCmBluDto } from '../dto/extracted-doc-cm-blu.dto';

@Injectable()
export class CmBluDocFormatterService {
  public toProposition(docCmBlu: ExtractedDocCmBluDto): Proposition {
    const { type, subType, doc, date, authors, status, ementa, session } =
      docCmBlu;

    const [day, month, year] = date.split('/');

    return {
      type,
      subType,
      docTitle: doc.title,
      docLink: doc.link,
      date: new Date(`${year}-${month}-${day}`).toISOString().split('T')[0],
      authors,
      status,
      ementa,
      session,
    };
  }
}
