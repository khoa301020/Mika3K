import {
  StringOption,
  BooleanOption,
  AttachmentOption,
  NumberOption,
} from 'necord';

export class CreateQuoteDto {
  @StringOption({
    name: 'keyword',
    description: "Quote's keyword",
    required: true,
  })
  keyword: string;

  @BooleanOption({
    name: 'is-private',
    description: 'Private?',
    required: true,
  })
  isPrivate: boolean;

  @StringOption({
    name: 'content',
    description: "Quote's content",
    required: false,
  })
  content?: string;

  @AttachmentOption({
    name: 'attachment',
    description: "Quote's attachment (only 1)",
    required: false,
  })
  attachment?: any;
}

export class GetQuoteDto {
  @StringOption({
    name: 'keyword',
    description: "Quote's keyword or ID",
    required: true,
  })
  keyword: string;
}

export class ListQuotesDto {
  @StringOption({
    name: 'sort',
    description: 'Sort by (key or hits)',
    required: false,
    choices: [
      { name: 'Keyword', value: 'key' },
      { name: 'Hits', value: 'hits' },
    ],
  })
  sort?: string;

  @NumberOption({
    name: 'order',
    description: 'Order',
    required: false,
    choices: [
      { name: 'Ascending', value: 1 },
      { name: 'Descending', value: -1 },
    ],
  })
  order?: number;
}

export class QuoteIdDto {
  @StringOption({ name: 'id', description: "Quote's ID", required: true })
  id: string;
}

export class EditQuoteDto {
  @StringOption({ name: 'id', description: "Quote's ID", required: true })
  id: string;

  @StringOption({
    name: 'content',
    description: "Quote's content",
    required: false,
  })
  content?: string;

  @AttachmentOption({
    name: 'attachment',
    description: "Quote's attachment",
    required: false,
  })
  attachment?: any;
}
