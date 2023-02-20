export interface IQuote {
  key: string;
  value: string;
}

export interface IUserQuote {
  guild: string;
  user: string;
  quote: IQuote;
  private?: Boolean;
  createdAt: Date;
}
