import { StringOption, BooleanOption, NumberOption } from 'necord';

export class AnimeSearchDto {
  @BooleanOption({
    name: 'display',
    description: 'Public display?',
    required: true,
  })
  display: boolean;

  @StringOption({ name: 'query', description: 'Search query', required: false })
  q?: string;

  @StringOption({
    name: 'type',
    description: 'Anime type',
    required: false,
    choices: [
      { name: 'TV', value: 'tv' },
      { name: 'Movie', value: 'movie' },
      { name: 'OVA', value: 'ova' },
      { name: 'Special', value: 'special' },
      { name: 'ONA', value: 'ona' },
      { name: 'Music', value: 'music' },
    ],
  })
  type?: string;

  @StringOption({
    name: 'status',
    description: 'Status',
    required: false,
    choices: [
      { name: 'Airing', value: 'airing' },
      { name: 'Complete', value: 'complete' },
      { name: 'Upcoming', value: 'upcoming' },
    ],
  })
  status?: string;

  @StringOption({
    name: 'order_by',
    description: 'Order by',
    required: false,
    choices: [
      { name: 'Score', value: 'score' },
      { name: 'Rank', value: 'rank' },
      { name: 'Popularity', value: 'popularity' },
      { name: 'Title', value: 'title' },
      { name: 'Members', value: 'members' },
    ],
  })
  order_by?: string;

  @StringOption({
    name: 'sort',
    description: 'Sort direction',
    required: false,
    choices: [
      { name: 'Ascending', value: 'asc' },
      { name: 'Descending', value: 'desc' },
    ],
  })
  sort?: string;

  @BooleanOption({
    name: 'sfw',
    description: 'Safe for work?',
    required: false,
  })
  sfw?: boolean;

  @StringOption({
    name: 'genres',
    description: 'Genre IDs (comma-separated)',
    required: false,
  })
  genres?: string;

  @NumberOption({
    name: 'min_score',
    description: 'Minimum score',
    required: false,
  })
  min_score?: number;

  @NumberOption({
    name: 'max_score',
    description: 'Maximum score',
    required: false,
  })
  max_score?: number;
}

export class MangaSearchDto {
  @BooleanOption({
    name: 'display',
    description: 'Public display?',
    required: true,
  })
  display: boolean;

  @StringOption({ name: 'query', description: 'Search query', required: false })
  q?: string;

  @StringOption({
    name: 'type',
    description: 'Manga type',
    required: false,
    choices: [
      { name: 'Manga', value: 'manga' },
      { name: 'Novel', value: 'novel' },
      { name: 'Light Novel', value: 'lightnovel' },
      { name: 'Oneshot', value: 'oneshot' },
      { name: 'Manhwa', value: 'manhwa' },
      { name: 'Manhua', value: 'manhua' },
    ],
  })
  type?: string;

  @StringOption({
    name: 'status',
    description: 'Status',
    required: false,
    choices: [
      { name: 'Publishing', value: 'publishing' },
      { name: 'Complete', value: 'complete' },
      { name: 'Hiatus', value: 'hiatus' },
      { name: 'Upcoming', value: 'upcoming' },
    ],
  })
  status?: string;

  @StringOption({
    name: 'order_by',
    description: 'Order by',
    required: false,
    choices: [
      { name: 'Score', value: 'score' },
      { name: 'Rank', value: 'rank' },
      { name: 'Popularity', value: 'popularity' },
      { name: 'Title', value: 'title' },
    ],
  })
  order_by?: string;

  @StringOption({
    name: 'sort',
    description: 'Sort direction',
    required: false,
    choices: [
      { name: 'Ascending', value: 'asc' },
      { name: 'Descending', value: 'desc' },
    ],
  })
  sort?: string;

  @BooleanOption({
    name: 'sfw',
    description: 'Safe for work?',
    required: false,
  })
  sfw?: boolean;
}

export class CharacterSearchDto {
  @BooleanOption({
    name: 'display',
    description: 'Public display?',
    required: true,
  })
  display: boolean;

  @StringOption({ name: 'query', description: 'Search query', required: false })
  q?: string;

  @StringOption({
    name: 'order_by',
    description: 'Order by',
    required: false,
    choices: [
      { name: 'MAL ID', value: 'mal_id' },
      { name: 'Name', value: 'name' },
      { name: 'Favorites', value: 'favorites' },
    ],
  })
  order_by?: string;

  @StringOption({
    name: 'sort',
    description: 'Sort direction',
    required: false,
    choices: [
      { name: 'Ascending', value: 'asc' },
      { name: 'Descending', value: 'desc' },
    ],
  })
  sort?: string;
}

export class PeopleSearchDto {
  @BooleanOption({
    name: 'display',
    description: 'Public display?',
    required: true,
  })
  display: boolean;

  @StringOption({ name: 'query', description: 'Search query', required: false })
  q?: string;

  @StringOption({
    name: 'order_by',
    description: 'Order by',
    required: false,
    choices: [
      { name: 'MAL ID', value: 'mal_id' },
      { name: 'Name', value: 'name' },
      { name: 'Birthday', value: 'birthday' },
      { name: 'Favorites', value: 'favorites' },
    ],
  })
  order_by?: string;

  @StringOption({
    name: 'sort',
    description: 'Sort direction',
    required: false,
    choices: [
      { name: 'Ascending', value: 'asc' },
      { name: 'Descending', value: 'desc' },
    ],
  })
  sort?: string;
}

export class GenresDto {
  @BooleanOption({
    name: 'display',
    description: 'Public display?',
    required: true,
  })
  display: boolean;

  @StringOption({
    name: 'filter',
    description: 'Genre filter',
    required: false,
    choices: [
      { name: 'Genres', value: 'genres' },
      { name: 'Explicit Genres', value: 'explicit_genres' },
      { name: 'Themes', value: 'themes' },
      { name: 'Demographics', value: 'demographics' },
    ],
  })
  filter?: string;
}
