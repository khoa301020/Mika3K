export interface ICurrency {
  [key: string]: string;
}

export interface ICurrencyValue {
  [key: string]: number;
}

export interface ICurrencyQuery {
  from: string;
  to: string;
  amount: number;
}

export interface ICurrencyResponseInfo {
  timestamp: number;
  rate: number;
}

export interface IExchangeResult {
  success: boolean;
  query: ICurrencyQuery;
  info: ICurrencyResponseInfo;
  date: string;
  result: number;
}

export interface IExchangeResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: ICurrencyValue;
}