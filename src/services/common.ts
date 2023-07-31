import axios from 'axios';
import { CommonConstants } from '../constants/index.js';
import { cache } from '../main.js';
import { ICurrencyResponse, IExchangeResponse } from '../types/currencies';

export async function cacheCurrencies(): Promise<void> {
  let res: ICurrencyResponse = await axios
    .get('https://raw.githubusercontent.com/khoa301020/Mika3K/main/src/resources/json/currencies.json')
    .then((res) => res.data);
  if (!res) res = await axios.get(CommonConstants.CURRENCY_LIST_API).then((res) => res.data);
  cache.set(
    'currencies',
    Object.entries(res.results).map(([, value]) => value),
  );
}

export async function exchangeCurrency(from: string, to: string, amount: number): Promise<number> {
  const query = `${from}_${to}`;
  const res = await axios.get(CommonConstants.CURRENCY_CONVERTER_API(query));
  const data: IExchangeResponse = res.data;
  return data[query] * amount;
}
