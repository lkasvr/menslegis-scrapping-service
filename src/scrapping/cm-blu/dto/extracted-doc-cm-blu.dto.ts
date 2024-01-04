type Doc = { title: string; link: string };

export class ExtractedDocCmBluDto {
  propositionPageLink: string;
  type: string;
  subtype: string;
  date: string;
  authors: string[];
  status: string;
  ementa: string;
  doc: Doc;
  session: string;

  constructor(
    propositionPageLink: string,
    type: string,
    subType: string,
    date: string,
    authors: string[],
    ementa: string,
    status: string,
    doc: Doc,
    session: string,
  ) {
    this.propositionPageLink = propositionPageLink;
    this.type = type;
    this.subtype = subType;
    this.date = date;
    this.authors = authors;
    this.status = status;
    this.ementa = ementa;
    this.doc = doc;
    this.session = session;
  }
}
