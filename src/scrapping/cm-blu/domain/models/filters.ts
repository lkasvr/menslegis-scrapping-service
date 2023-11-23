type Filters =
  | string
  | {
      endpoint?: string;
      type?: string;
      subType?: string;
      author?: string;
      year?: number;
    };
export default Filters;
