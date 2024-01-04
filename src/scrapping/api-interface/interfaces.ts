export interface Proposition {
  name: string;
  description?: string;
  status?: string;
  pageDocLink?: string;
  docLink?: string;
  type: string;
  subtype: string;
  docDate: string;
  politicalBodyId?: string;
  politicalBodyName?: string;
  authors: { code?: string; name?: string }[];
}
