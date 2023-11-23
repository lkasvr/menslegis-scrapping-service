import { DocCmBluSubTypes } from '../../enums/doc-cm-blu-sub-types.enum';
import { DocCmBluTypes } from '../../enums/doc-cm-blu-types.enum';

export type AllFilters = {
  endpoint?: string;
  type?: DocCmBluTypes;
  subType?: DocCmBluSubTypes;
  status?: string;
  author?: string;
  year?: number;
};

type Filters = Omit<AllFilters, 'endpoint'>;

export default Filters;
