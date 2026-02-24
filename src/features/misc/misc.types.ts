export interface ISaucenaoSearchRequest {
  url: string;
  output_type: number;
  api_key: string;
  testmode?: number;
  db?: number;
  dedupe?: number;
  hide?: number;
}

export interface ISaucenaoSearchResponse {
  header?: {
    status?: number;
    minimum_similarity?: number;
    message?: string;
  };
  results?: ISaucenaoSearchResult[];
}

export interface ISaucenaoSearchResult {
  header?: {
    similarity?: string;
    thumbnail?: string;
    index_id?: number;
    index_name?: string;
    dupes?: number;
  };
  data?: any;
}

export interface ICurrencyQuery {
  from: string;
  to: string;
  amount: number;
}

export interface IExchangeResult {
  success: boolean;
  query: ICurrencyQuery;
  info: { timestamp: number; rate: number };
  date: string;
  result: number;
}
