export interface QueryActions {
  save?: () => void;
  delete?: <Input, R>(arg: Input) => R;
}

export type Hash = string;
export type Hashes = string[];
