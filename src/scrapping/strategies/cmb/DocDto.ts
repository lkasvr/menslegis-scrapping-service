export class DocDto {
  date: string;
  authors: string[] | string;
  status: string;
  ementa: string;

  constructor(date: string, authors: string, ementa: string, status: string) {
    this.date = date;
    this.authors = authors;
    this.status = status;
    this.ementa = ementa;
  }
}
