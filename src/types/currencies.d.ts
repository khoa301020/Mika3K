export interface ICurrencyResponse {
  [key: string]: ICurrency;
}
export interface ICurrency {
  currencyName: string;
  currencySymbol?: string;
  id: string;
}

export interface IExchangeResponse {
  [key: string]: number;
}
