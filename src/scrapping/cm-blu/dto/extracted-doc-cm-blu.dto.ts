export class ExtractedDocCmBluDto {
  type: string;
  subType: string;
  date: string;
  authors: string[] | string;
  status: string;
  ementa: string;

  constructor(
    type: string,
    subType: string,
    date: string,
    authors: string,
    ementa: string,
    status: string,
  ) {
    this.type = type;
    this.subType = subType;
    this.date = date;
    this.authors = authors;
    this.status = status;
    this.ementa = ementa;
  }
}
