export interface Proposition {
  name: string;
  description?: string;
  status?: string;
  docLink?: string;
  type: string;
  subType: string;
  docDate: string;
  politicalBodyId?: string;
  politicalBodyName?: string;
  authors: { id?: string; name?: string }[];
}
