import { CHAIN_TO_ADDRESSES_MAP, ChainId, Token } from 'lampros-core';

import { NETWORKS_WITH_SAME_UNISWAP_ADDRESSES } from './chains';

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MODE]: CHAIN_TO_ADDRESSES_MAP[ChainId.MODE].v3CoreFactoryAddress,
};

export const QUOTER_V2_ADDRESSES: AddressMap = {
  [ChainId.MODE]: CHAIN_TO_ADDRESSES_MAP[ChainId.MODE].quoterAddress,
};

export const UNISWAP_MULTICALL_ADDRESSES: AddressMap = {
  [ChainId.MODE]: CHAIN_TO_ADDRESSES_MAP[ChainId.MODE].multicallAddress,
};

export const SWAP_ROUTER_02_ADDRESSES = (chainId: number): string => {
  if (chainId == ChainId.MODE) {
    return '0x9613da2D81495589CCe112CC4C7fC650A5eC2610';
  }
  return '0x9613da2D81495589CCe112CC4C7fC650A5eC2610';
};

export const OVM_GASPRICE_ADDRESS =
  '0x420000000000000000000000000000000000000F';
export const ARB_GASINFO_ADDRESS = '0x000000000000000000000000000000000000006C';
export const TICK_LENS_ADDRESS =
  CHAIN_TO_ADDRESSES_MAP[ChainId.MODE].tickLensAddress;
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS =
  CHAIN_TO_ADDRESSES_MAP[ChainId.MODE].nonfungiblePositionManagerAddress;
export const V3_MIGRATOR_ADDRESS =
  CHAIN_TO_ADDRESSES_MAP[ChainId.MODE].v3MigratorAddress;
export const MULTICALL2_ADDRESS = '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696';

export type AddressMap = { [chainId: number]: string | undefined };

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: ChainId[] = []
): { [chainId: number]: T } {
  return NETWORKS_WITH_SAME_UNISWAP_ADDRESSES.concat(
    additionalNetworks
  ).reduce<{
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
