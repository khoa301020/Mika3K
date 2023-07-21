import { THoyoGame } from '../types/hoyolab';

const getEventBaseUrl = (game: THoyoGame) => {
  if (game === 'genshin') {
    return HoYoLABConstants.HK4E_API;
  } else if (game === 'hi3' || game === 'hsr') {
    return HoYoLABConstants.PUBLIC_API;
  }
  return '';
};

export class HoYoLABConstants {
  public static readonly HOYOLAB_GET_USER =
    'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesByCookieToken';
  public static readonly REDEEM_TARGET = {
    genshin: { name: 'Genshin Impact', prefix: 'hk4e', actId: 'e202102251931481', event: 'sol' },
    hsr: { name: 'Honkai Star Rail', prefix: 'hkrpg', actId: 'e202303301540311', event: 'luna/os' },
    hi3: { name: 'Honkai Impact 3rd', prefix: 'bh3', actId: 'e202110291205111', event: 'mani' },
  };
  public static readonly REDEEM_CODE_API = {
    genshin: 'https://sg-hk4e-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
    hsr: 'https://sg-hkrpg-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
    hi3: 'https://sg-bh3-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
  };

  /* HoYoLAB Main API */
  public static readonly BBS_API = 'https://bbs-api-os.hoyolab.com';
  public static readonly ACCOUNT_API = 'https://api-account-os.hoyolab.com';
  public static readonly HK4E_API = 'https://sg-hk4e-api.hoyolab.com';
  public static readonly PUBLIC_API = `https://sg-public-api.hoyolab.com`;
  public static readonly DEFAULT_REFERER = 'https://hoyolab.com';

  /* HoYoLAB API Endpoint */
  public static readonly USER_GAMES_LIST = `${this.ACCOUNT_API}/account/binding/api/getUserGameRolesByCookieToken`;
  public static readonly GAME_RECORD_CARD_API = `${this.BBS_API}/game_record/card/wapi/getGameRecordCard`;

  /* Daily check-in endpoint */
  public static readonly DAILY_INFO_API = (game: THoyoGame) => {
    return `${getEventBaseUrl(game)}/event/${this.REDEEM_TARGET[game].event}/info?act_id=${
      this.REDEEM_TARGET[game].actId
    }`;
  };

  public static readonly DAILY_REWARD_API = (game: THoyoGame) => {
    return `${getEventBaseUrl(game)}/event/${this.REDEEM_TARGET[game].event}/home?act_id=${
      this.REDEEM_TARGET[game].actId
    }`;
  };

  public static readonly DAILY_CLAIM_API = (game: THoyoGame) => {
    return `${getEventBaseUrl(game)}/event/${this.REDEEM_TARGET[game].event}/sign?act_id=${
      this.REDEEM_TARGET[game].actId
    }`;
  };
}
