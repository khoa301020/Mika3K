import {
  StringOption,
  BooleanOption,
  AttachmentOption,
  UserOption,
} from 'necord';

export class MathDto {
  @StringOption({
    name: 'expression',
    description: 'Math expression',
    required: true,
  })
  expression: string;
}

export class CurrencyExchangeDto {
  @StringOption({
    name: 'from',
    description: 'From currency',
    required: true,
    autocomplete: true,
  })
  from: string;

  @StringOption({
    name: 'to',
    description: 'To currency',
    required: true,
    autocomplete: true,
  })
  to: string;

  @StringOption({
    name: 'amount',
    description: 'Amount or expression',
    required: true,
  })
  amount: string;
}

export class CheckInfoDto {
  @UserOption({ name: 'user', description: 'User to check', required: false })
  user?: any;
}

export class SaucenaoDto {
  @BooleanOption({
    name: 'is-public',
    description: 'Public result?',
    required: true,
  })
  isPublic: boolean;

  @StringOption({ name: 'url', description: 'Image URL', required: false })
  url?: string;

  @AttachmentOption({
    name: 'attachment',
    description: 'Image attachment',
    required: false,
  })
  attachment?: any;
}
