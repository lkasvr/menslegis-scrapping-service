type Doc = { title: string; link: string };

export class ExtractedDocCmBluDto {
  type: string;
  subType: string;
  date: string;
  authors: string;
  status: string;
  ementa: string;
  doc: Doc;
  session: string;

  constructor(
    type: string,
    subType: string,
    date: string,
    authors: string,
    ementa: string,
    status: string,
    doc: Doc,
    session: string,
  ) {
    this.type = type;
    this.subType = subType;
    this.date = date;
    this.authors = authors;
    this.status = status;
    this.ementa = ementa;
    this.doc = doc;
    this.session = session;
  }
}
