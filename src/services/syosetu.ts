import { ISyosetuRequest } from '../types/syosetu';

export const convertToQuery = (request: ISyosetuRequest): string =>
  Object.entries(request).reduce(
    (acc, [key, value]) => (Array.isArray(value) ? (acc += `${key}=${value.join('-')}&`) : (acc += `${key}=${value}&`)),
    '?',
  );
