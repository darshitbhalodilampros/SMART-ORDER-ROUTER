/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Ether, NativeCurrency, Token } from 'lampros-core';

export enum ChainId {
  MODE = 919,
}

// WIP: Gnosis, Moonbeam
export const SUPPORTED_CHAINS: ChainId[] = [ChainId.MODE];

// export const V2_SUPPORTED = [ChainId.ROLLUX_TANENBAUM, ChainId.ROLLUX];

export const HAS_L1_FEE: ChainId[] = []; //TODO: add rollux

// export const NETWORKS_WITH_SAME_UNISWAP_ADDRESSES = [
//   ChainId.ROLLUX,
//   ChainId.ROLLUX_TANENBAUM,
// ];

export const ID_TO_CHAIN_ID = (id: number): ChainId => {
  switch (id) {
    case 919:
      return ChainId.MODE;
    default:
      throw new Error(`Unknown chain id: ${id}`);
  }
};

export enum ChainName {
  MODE = 'mode',
}

export enum NativeCurrencyName {
  // Strings match input for CLI
  ETH = 'ETH',
}
export const NATIVE_NAMES_BY_ID: { [chainId: number]: string[] } = {
  [ChainId.MODE]: [
    'ETH',
    'Ether',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ],
};

export const NATIVE_CURRENCY: { [chainId: number]: NativeCurrencyName } = {
  [ChainId.MODE]: NativeCurrencyName.ETH,
};

export const ID_TO_NETWORK_NAME = (id: number): ChainName => {
  switch (id) {
    case 919:
      return ChainName.MODE;
    default:
      throw new Error(`Unknown chain id: ${id}`);
  }
};

export const CHAIN_IDS_LIST = Object.values(ChainId).map((c) =>
  c.toString()
) as string[];

export const ID_TO_PROVIDER = (id: ChainId): string => {
  switch (id) {
    case ChainId.MODE:
      return 'https://sepolia.mode.network'!;
    default:
      throw new Error(`Chain id: ${id} not supported`);
  }
};

export const WRAPPED_NATIVE_CURRENCY: { [chainId in ChainId]: Token } = {
  [ChainId.MODE]: new Token(
    ChainId.MODE,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether'
  ),
};

export class ExtendedEther extends Ether {
  public get wrapped(): Token {
    if (this.chainId in WRAPPED_NATIVE_CURRENCY)
      return WRAPPED_NATIVE_CURRENCY[this.chainId as ChainId];
    throw new Error('Unsupported chain ID');
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } =
    {};

  public static onChain(chainId: number): ExtendedEther {
    return (
      this._cachedExtendedEther[chainId] ??
      (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
    );
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency } = {};
export function nativeOnChain(chainId: number): NativeCurrency {
  if (cachedNativeCurrency[chainId] != undefined)
    return cachedNativeCurrency[chainId]!;
  cachedNativeCurrency[chainId] = ExtendedEther.onChain(chainId);
  return cachedNativeCurrency[chainId]!;
}
