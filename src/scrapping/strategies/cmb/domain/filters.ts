type Filters =
  | {
      endpoint?: string;
      type?: string;
      subType?: string;
      author?: string;
      year?: number;
    }
  | string;
export default Filters;
