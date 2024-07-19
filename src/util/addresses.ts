import { ChainId, Token } from 'lampros-core';

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MODE]: '0x5091730383fE325040813281231D323049Eeaf8b',
};

export const QUOTER_V2_ADDRESSES: AddressMap = {
  [ChainId.MODE]: '0x9613da2D81495589CCe112CC4C7fC650A5eC2610',
};

// export const NEW_QUOTER_V2_ADDRESSES: AddressMap = {
//   [ChainId.MODE]: '0x5e55C9e631FAE526cd4B0526C4818D6e0a9eF0e3',
// };

export const UNISWAP_MULTICALL_ADDRESSES: AddressMap = {
  [ChainId.MODE]: '0xcd9845c3233Dbd3274Be6054f21CE26C79e5a65E',
};

export const SWAP_ROUTER_02_ADDRESSES = (_chainId: number): string => {
  return '0x22dc8CA232debF877eFF0628FF9215519e8083f4';
};

export const OVM_GASPRICE_ADDRESS =
  '0x420000000000000000000000000000000000000F';
export const ARB_GASINFO_ADDRESS = '0x000000000000000000000000000000000000006C';
export const TICK_LENS_ADDRESS = '0xE5a7A29FF8D7F6EEc07377b791F4F9db7f3FFDBC';
('0x2a8cC9911201FD188fDD641df81044C9a6F76B01');
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS =
  '0xEF3e32154B5Fb96D56D339e655A5edf5f5661Af8';
export const V3_MIGRATOR_ADDRESS = '0x2a8cC9911201FD188fDD641df81044C9a6F76B01';
export const MULTICALL2_ADDRESS = '0x338d2F65468A2Ac6D51Af94BE3A45858a21e6615';

export type AddressMap = { [chainId: number]: string | undefined };

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: ChainId[] = []
): { [chainId: number]: T } {
  return additionalNetworks.reduce<{
    [chainId: number]: T;
  }>((memo, chainId) => {
    memo[chainId] = address;
    return memo;
  }, {});
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const WETH9: {} = {
  [ChainId.MODE]: new Token(
    ChainId.MODE,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether'
  ),
};
