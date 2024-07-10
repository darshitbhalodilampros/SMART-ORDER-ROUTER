import { Token } from 'lampros-core';
// import { FACTORY_ADDRESS } from 'lampros-v3';

import { ChainId } from './chains';

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MODE]: '0x5091730383fE325040813281231D323049Eeaf8b', // mode
};

export const QUOTER_V2_ADDRESSES: AddressMap = {
  [ChainId.MODE]: '0x9613da2D81495589CCe112CC4C7fC650A5eC2610', // mode
};

// export const MIXED_ROUTE_QUOTER_V1_ADDRESSES: AddressMap = {
//   [ChainId.ROLLUX]: '0xD8EDc12630284A057461300dE5317b148F7F8926',
// };

export const UNISWAP_MULTICALL_ADDRESSES: AddressMap = {
  [ChainId.MODE]: '0xcd9845c3233Dbd3274Be6054f21CE26C79e5a65E', // mode
  // [ChainId.ROLLUX_TANENBAUM]: '0x0fC3574BFff5FF644A11B7B13A70B484F8e01D08'
};

export const SWAP_ROUTER_02_ADDRESSES = (_chainId: number) => {
  return '0x22dc8CA232debF877eFF0628FF9215519e8083f4'; // mode
};

export const OVM_GASPRICE_ADDRESS =
  '0x420000000000000000000000000000000000000F';
export const ARB_GASINFO_ADDRESS = '0x000000000000000000000000000000000000006C';
export const TICK_LENS_ADDRESS = '0xE5a7A29FF8D7F6EEc07377b791F4F9db7f3FFDBC'; // mode
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS =
  '0xEF3e32154B5Fb96D56D339e655A5edf5f5661Af8'; // mode
export const V3_MIGRATOR_ADDRESS = '0x2a8cC9911201FD188fDD641df81044C9a6F76B01'; // mode
export const MULTICALL2_ADDRESS = '0x338d2F65468A2Ac6D51Af94BE3A45858a21e6615'; // mode

export type AddressMap = { [chainId: number]: string };

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

export const WETH9: {
  [chainId in ChainId]: Token;
} = {
  [ChainId.MODE]: new Token(
    ChainId.MODE,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  // [ChainId.ROLLUX_TANENBAUM]: new Token(
  //   ChainId.ROLLUX_TANENBAUM,
  //   '0x4200000000000000000000000000000000000006',
  //   18,
  //   'WSYS',
  //   'Wrapped Syscoin'
  // ),
};
