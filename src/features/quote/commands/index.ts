import { QuoteManagementCommands } from './quote-management.commands';
import { QuoteRetrievalCommands } from './quote-retrieval.commands';

export { QuoteManagementCommands, QuoteRetrievalCommands };

export const QuoteCommandProviders = [
  QuoteManagementCommands,
  QuoteRetrievalCommands,
];
