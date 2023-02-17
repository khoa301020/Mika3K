export interface IQuote {
  key?: string;
  value?: string;
}

export interface IUserQuote {
  user?: string;
  quote?: IQuote;
  private?: Boolean;
  createdAt?: Date;
}
