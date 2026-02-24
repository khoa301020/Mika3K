/* Typings for MAL Anime */

export interface IPagination {
  last_visible_page: number;
  has_next_page: boolean;
}
export interface IAnime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
    images: {
      image_url: string;
      small_image_url: string;
      medium_image_url: string;
      large_image_url: string;
      maximum_image_url: string;
    };
  };
  approved: boolean;
  titles: {
    type: string;
    title: string;
  }[];
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: {
    from: string;
    to: string;
    prop: {
      from: {
        day: number;
        month: number;
        year: number;
      };
      to: {
        day: number;
        month: number;
        year: number;
      };
    };
    string: string;
  };
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  season: string;
  year: number;
  broadcast: {
    day: string;
    time: string;
    timezone: string;
    string: string;
  };
  producers: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  licensors: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  studios: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  genres: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  explicit_genres: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  themes: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  demographics: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
}
export interface IAnimeFull extends IAnime {
  relations: IAnimeRelations['data'];
  theme: IAnimeThemes;
  external: IAnimeExternal['data'];
  streaming: IAnimeExternal['data'];
}
export interface IAnimeCharacters {
  data: Array<IAnimeCharacter>;
}
export interface IAnimeCharacter {
  anime_mal_id?: number;
  character: IAnimeCharacterCharacter;
  role: string;
  favorites: number;
  voice_actors: Array<IAnimeCharacterVoiceActor>;
}
export interface IAnimeCharacterCharacter {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
    };
  };
  name: string;
}
export interface IAnimeCharacterVoiceActor {
  person: {
    mal_id: number;
    url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
    name: string;
  };
  language: string;
}
export interface IAnimeStaffs {
  data: Array<IAnimeStaff>;
}
export interface IAnimeStaff {
  person: {
    mal_id: number;
    url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
    name: string;
  };
  positions: string[];
}
export interface IAnimeEpisodes {
  pagination: IPagination;
  data: Array<IAnimeEpisode>;
}
export interface IAnimeEpisode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string;
  title_romanji: string;
  score: number;
  aired: Date | string;
  filler: boolean;
  recap: boolean;
}
export interface IAnimeNews {
  pagination: IPagination;
  data: {
    mal_id: number;
    url: string;
    title: string;
    date: string;
    author_username: string;
    author_url: string;
    forum_url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
    comments: number;
    excerpt: string;
  }[];
}
export interface IAnimeForum {
  data: {
    mal_id: number;
    url: string;
    title: string;
    date: string;
    author_username: string;
    author_url: string;
    comments: number;
    last_comment: {
      url: string;
      author_username: string;
      author_url: string;
      date: string;
    };
  }[];
}
export interface IAnimeVideos {
  promo: {
    title: string;
    trailer: {
      youtube_id: string;
      url: string;
      embed_url: string;
      images: {
        image_url: string;
        small_image_url: string;
        medium_image_url: string;
        large_image_url: string;
        maximum_image_url: string;
      };
    };
  }[];
  episodes: {
    mal_id: number;
    title: string;
    epiosode: string;
    url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  }[];
}
export interface IAnimePictures {
  data: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  }[];
}
export interface IAnimeStats {
  watching: number;
  completed: number;
  on_hold: number;
  dropped: number;
  plan_to_watch: number;
  total: number;
  scores: {
    score: number;
    votes: number;
    percentage: number;
  }[];
}
export interface IAnimeMoreInfo {
  moreinfo: string;
}
export interface IAnimeRecommendations {
  data: {
    entry: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
      };
      title: string;
    };
    url: string;
    votes: number;
  }[];
}
export interface IAnimeUserUpdates {
  pagination: IPagination;
  data: {
    user: {
      username: string;
      url: string;
      images: {
        jpg: {
          image_url: string;
        };
        webp: {
          image_url: string;
        };
      };
    };
    score: number;
    status: string;
    episodes_seen: number;
    episodes_total: number;
    date: string;
  }[];
}
export interface IAnimeReviews {
  pagination: IPagination;
  data: {
    mal_id: number;
    url: string;
    type: string;
    votes: number;
    date: string;
    review: string;
    episodes_watch: number;
    scores: {
      overall: number;
      story: number;
      animation: number;
      sound: number;
      character: number;
      enjoyment: number;
    };
    user: {
      url: string;
      username: string;
      images: {
        jpg: {
          image_url: string;
        };
        webp: {
          image_url: string;
        };
      };
    };
  }[];
}
export interface IAnimeRelations {
  data: {
    relation: string;
    entry: {
      mal_id: number;
      type: string;
      name: string;
      url: string;
    }[];
  }[];
}
export interface IAnimeThemes {
  anime_mal_id: number;
  openings: string[];
  endings: string[];
}
export interface IAnimeExternal {
  data: {
    name: string;
    url: string;
  }[];
}
export interface IAnimeSearch {
  pagination: IPagination;
  data: IAnime[];
}
export interface ITopAnime {
  pagination: IPagination;
  data: IAnime[];
}

/* Typings for MAL Manga */
export interface IManga {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  approved: boolean;
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  chapters: number;
  volumes: number;
  status: string;
  publishing: boolean;
  published: {
    from: string;
    to: string;
    prop: {
      from: {
        day: number;
        month: number;
        year: number;
      };
      to: {
        day: number;
        month: number;
        year: number;
      };
    };
    string: string;
  };
  scored: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  authors: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  serializations: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  genres: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  explicit_genres: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  themes: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
  demographics: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
}
export interface IMangaCharacters {
  data: {
    character: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
        };
        webp: {
          image_url: string;
        };
      };
      name: string;
    };
    role: string;
  }[];
}
export interface IMangaNews {
  pagination: IPagination;
  data: {
    mal_id: number;
    url: string;
    title: string;
    date: string;
    author_username: string;
    author_url: string;
    forum_url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
    comments: number;
    excerpt: string;
  }[];
}
export interface IMangaTopics {
  data: {
    mal_id: number;
    url: string;
    title: string;
    date: string;
    author_username: string;
    author_url: string;
    comments: number;
    last_comment: {
      url: string;
      author_username: string;
      author_url: string;
      date: string;
    };
  }[];
}
export interface IMangaPictures {
  data: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  }[];
}
export interface IMangaStats {
  reading: number;
  completed: number;
  on_hold: number;
  dropped: number;
  plan_to_read: number;
  total: number;
  scores: {
    score: number;
    votes: number;
    percentage: number;
  }[];
}
export interface IMangaMoreInfo {
  moreinfo: string;
}
export interface IMangaRecommendations {
  data: {
    entry: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
      };
      title: string;
    };
    url: string;
    votes: number;
  }[];
}
export interface IMangaUserUpdates {
  pagination: IPagination;
  data: {
    user: {
      username: string;
      url: string;
      images: {
        jpg: {
          image_url: string;
        };
        webp: {
          image_url: string;
        };
      };
    };
    score: number;
    status: string;
    volumes_read: number;
    volumes_total: number;
    chapters_read: number;
    chapters_total: number;
    date: string;
  }[];
}
export interface IMangaReviews {
  pagination: IPagination;
  data: {
    mal_id: number;
    url: string;
    type: string;
    votes: number;
    date: string;
    review: string;
    chapters_read: number;
    scores: {
      overall: number;
      story: number;
      art: number;
      character: number;
      enjoyment: number;
    };
    user: {
      url: string;
      username: string;
      images: {
        jpg: {
          image_url: string;
        };
        webp: {
          image_url: string;
        };
      };
    };
  }[];
}
export interface IMangaRelations {
  data: {
    relation: string;
    entry: {
      mal_id: number;
      type: string;
      name: string;
      url: string;
    }[];
  }[];
}
export interface IMangaExternals {
  data: {
    name: string;
    url: string;
  }[];
}
export interface IMangaSearch {
  pagination: IPagination;
  data: IManga[];
}
export interface ITopManga {
  pagination: IPagination;
  data: IManga[];
}

/* Typings for MAL Characters */

export interface ICharacter {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
    webp: {
      image_url: string;
    };
  };
  name: string;
  nicknames: string[];
  favorites: number;
  about: string;
}
export interface ICharacterAnime {
  data: {
    role: string;
    anime: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
      };
      title: string;
    };
  }[];
}
export interface ICharacterManga {
  data: {
    role: string;
    manga: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
      };
      title: string;
    };
  }[];
}
export interface ICharacterVoices {
  data: {
    language: string;
    person: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
      name: string;
    };
  }[];
}
export interface ICharacterPictures {
  data: {
    jpg: {
      image_url: string;
    };
  }[];
}
export interface ICharacterSearch {
  pagination: IPagination;
  data: ICharacter[];
}
export interface ITopCharacter {
  pagination: IPagination;
  data: ICharacter[];
}

/* Typings for MAL People */

export interface IPeople {
  mal_id: number;
  url: string;
  website_url: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  name: string;
  given_name: string;
  family_name: string;
  alternate_names: string[];
  birthday: number;
  favorites: number;
  about: string;
}
export interface IPeopleAnime {
  data: {
    position: string;
    anime: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
      };
      title: string;
    };
  }[];
}
export interface IPeopleManga {
  data: {
    position: string;
    manga: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
      };
      title: string;
    };
  }[];
}
export interface IPeopleVoices {
  data: {
    role: string;
    anime: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
          large_image_url: string;
        };
      };
      title: string;
    };
    character: {
      mal_id: number;
      url: string;
      images: {
        jpg: {
          image_url: string;
          small_image_url: string;
        };
        webp: {
          image_url: string;
          small_image_url: string;
        };
      };
      name: string;
    };
  }[];
}
export interface IPeoplePictures {
  data: {
    jpg: {
      image_url: string;
    };
  }[];
}
export interface IPeopleSearch {
  pagination: IPagination;
  data: IPeople[];
}
export interface ITopPeople {
  pagination: IPagination;
  data: IPeople[];
}

/* Typings for genres search */

export interface IGenre {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}

/* Typings for MAL user */

export interface IUser {
  id: number;
  name: string;
  picture: string;
  gender?: string;
  birthday?: string;
  location?: string;
  joined_at: Date;
  anime_statistics?: IUserAnimeStats;
  time_zone?: string;
  is_supporter?: boolean;
}

export interface IUserAnimeStats {
  num_items_watching: number;
  num_items_completed: number;
  num_items_on_hold: number;
  num_items_dropped: number;
  num_items_plan_to_watch: number;
  num_items: number;
  num_days_watched: number;
  num_days_watching: number;
  num_days_completed: number;
  num_days_on_hold: number;
  num_days_dropped: number;
  num_days: number;
  num_episodes: number;
  num_times_rewatched: number;
  mean_score: number;
}

export interface IUserAnime {
  node: IUserAnimeNode;
  list_status: IUserAnimeStatus;
}

export interface IUserAnimeNode {
  id: number;
  title: string;
  main_picture: {
    medium: string;
    large: string;
  };
}
export interface IUserAnimeStatus {
  status: TAnimeStatusUser;
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  updated_at?: Date;
  start_date?: Date;
  finish_date?: Date;
}
export interface IUserManga {
  node: IUserMangaNode;
  list_status: IUserMangaStatus;
}

export interface IUserMangaNode {
  id: number;
  title: string;
  main_picture: {
    medium: string;
    large: string;
  };
}
export interface IUserMangaStatus {
  status: TMangaStatusUser;
  is_rereading: boolean;
  num_volumes_read: number;
  num_chapters_read: number;
  score: number;
  updated_at?: Date;
  start_date?: Date;
  finish_date?: Date;
}

/* Typings for search options */

export interface IAnimeSearchOptions {
  page?: number;
  limit?: number;
  type?: TAnimeType;
  score?: number;
  min_score?: number;
  max_score?: number;
  status?: TAnimeStatus;
  rating?: TAnimeRating;
  sfw?: boolean;
  genres?: number[];
  genres_exclude?: number[];
  order_by?: TAnimeOrder;
  sort?: TSort;
  letter?: string;
  producer?: number[];
}
export interface ICharacterSearchOptions {
  page?: number;
  limit?: number;
  order_by?: TCharacterOrder;
  sort?: TSort;
  letter?: string;
}
export interface IMangaSearchOptions {
  page?: number;
  limit?: number;
  type?: TMangaType;
  score?: number;
  min_score?: number;
  max_score?: number;
  status?: TMangaStatus;
  sfw?: boolean;
  genres?: number[];
  genres_exclude?: number[];
  order_by?: TMangaOrder;
  sort?: TSort;
  letter?: string;
  magazine?: number[];
}
export interface ISimpleOption {
  query?: number;
}
export declare type TAnimeType = 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music';
export declare type TMangaType = 'manga' | 'novel' | 'doujin' | 'manhwa' | 'manhua' | 'lightnovel' | 'oneshot';
export declare type TAnimeStatus = 'airing' | 'complete' | 'upcoming';
export declare type TAnimeStatusUser = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
export declare type TMangaStatus = 'publishing' | 'complete' | 'hiatus' | 'discontinued' | 'upcoming';
export declare type TMangaStatusUser = 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_read';
export declare type TAnimeRating = 'g' | 'pg' | 'pg13' | 'r' | 'r17' | 'r' | 'rx';
export declare type TAnimeOrder =
  | 'mal_id'
  | 'title'
  | 'type'
  | 'rating'
  | 'start_date'
  | 'end_date'
  | 'episodes'
  | 'score'
  | 'scored_by'
  | 'rank'
  | 'popularity'
  | 'members'
  | 'favorites';
export declare type TAnimeFilter = 'all' | 'episode' | 'other';
export declare type TMangaOrder =
  | 'mal_id'
  | 'title'
  | 'start_date'
  | 'end_date'
  | 'chapters'
  | 'volumes'
  | 'score'
  | 'scored_by'
  | 'rank'
  | 'popularity'
  | 'members'
  | 'favorites';
export declare type TCharacterOrder = 'mal_id' | 'name' | 'favorites';
export declare type TSort = 'desc' | 'asc';
export declare type TMethods = 'anime' | 'manga' | 'characters' | 'random' | 'top';
