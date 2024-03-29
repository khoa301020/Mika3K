import axios from 'axios';
import qs from 'qs';
import { CommonConstants } from '../constants/index.js';
import { ICurrencyQuery, IExchangeResult } from '../types/currencies';

export async function exchangeCurrency(query: ICurrencyQuery): Promise<IExchangeResult> {
  const latestQuery = {
    base: 'EUR',
    symbols: `${query.from},${query.to}`,
  };
  const res = await axios.get(CommonConstants.CURRENCY_CONVERTER_API(qs.stringify(latestQuery)));
  return {
    success: res.data.success || false,
    query,
    info: {
      timestamp: res.data.timestamp,
      rate: (1 / res.data.rates[query.from]) * res.data.rates[query.to],
    },
    date: res.data.date,
    result: query.amount * ((1 / res.data.rates[query.from]) * res.data.rates[query.to]),
  };
}
