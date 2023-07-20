export class HoYoLABConstants {
  public static readonly HOYOLAB_GET_USER =
    'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesByCookieToken';
  public static readonly REDEEM_TARGET = {
    genshin: { name: 'Genshin Impact', prefix: 'hk4e' },
    hsr: { name: 'Honkai Star Rail', prefix: 'hkrpg' },
  };
  public static readonly REDEEM_CODE_API = {
    genshin: 'https://sg-hk4e-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
    hsr: 'https://sg-hkrpg-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
  };
}
