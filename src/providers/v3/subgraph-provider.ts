import retry from 'async-retry';
import Timeout from 'await-timeout';
import { gql, GraphQLClient } from 'graphql-request';
import { ChainId, Token } from 'lampros-core';
import _ from 'lodash';

import { log, metric } from '../../util';
import { ProviderConfig } from '../provider';

export interface V3SubgraphPool {
  id: string;
  feeTier: string;
  liquidity: string;
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
  tvlETH: number;
  tvlUSD: number;
}

type RawV3SubgraphPool = {
  id: string;
  feeTier: string;
  liquidity: string;
  token0: {
    symbol: string;
    id: string;
  };
  token1: {
    symbol: string;
    id: string;
  };
  totalValueLockedUSD: string;
  totalValueLockedETH: string;
};

export const printV3SubgraphPool = (s: V3SubgraphPool) =>
  `${s.token0.id}/${s.token1.id}/${s.feeTier}`;

const SUBGRAPH_URL_BY_CHAIN: { [chainId in ChainId]?: string } = {
  [ChainId.MODE]:
    'https://api.goldsky.com/api/public/project_clvqb3g2poub601xzgkzc9oxs/subgraphs/udonswap-v3/1/gn',
};

const PAGE_SIZE = 1000; // 1k is max possible query size from subgraph.

/**
 * Provider for getting V3 pools from the Subgraph
 *
 * @export
 * @interface IV3SubgraphProvider
 */
export interface IV3SubgraphProvider {
  getPools(
    tokenIn?: Token,
    tokenOut?: Token,
    providerConfig?: ProviderConfig
  ): Promise<V3SubgraphPool[]>;
}

export class V3SubgraphProvider implements IV3SubgraphProvider {
  private client: GraphQLClient;

  constructor(
    private chainId: ChainId,
    private retries = 2,
    private timeout = 30000,
    private rollback = true,
    private subgraphUrlOverride?: string
  ) {
    const subgraphUrl =
      this.subgraphUrlOverride ?? SUBGRAPH_URL_BY_CHAIN[this.chainId];
    if (!subgraphUrl) {
      throw new Error(`No subgraph url for chain id: ${this.chainId}`);
    }
    this.client = new GraphQLClient(subgraphUrl);
  }

  public async getPools(
    _tokenIn?: Token,
    _tokenOut?: Token,
    providerConfig?: ProviderConfig
  ): Promise<V3SubgraphPool[]> {
    const beforeAll = Date.now();
    let blockNumber = providerConfig?.blockNumber
      ? await providerConfig.blockNumber
      : undefined;

    const query = gql`
      query getPools($pageSize: Int!, $id: String) {
        pools(
          first: $pageSize
          ${blockNumber ? `block: { number: ${blockNumber} }` : ``}
          where: { id_gt: $id }
        ) {
          id
          token0 {
            symbol
            id
          }
          token1 {
            symbol
            id
          }
          feeTier
          liquidity
          totalValueLockedUSD
          totalValueLockedETH
        }
      }
    `;

    let pools: RawV3SubgraphPool[] = [];

    log.info(
      `Getting V3 pools from the subgraph with page size ${PAGE_SIZE}${
        providerConfig?.blockNumber
          ? ` as of block ${providerConfig?.blockNumber}`
          : ''
      }.`
    );

    let retries = 0;

    await retry(
      async () => {
        const timeout = new Timeout();

        const getPools = async (): Promise<RawV3SubgraphPool[]> => {
          let lastId = '';
          let pools: RawV3SubgraphPool[] = [];
          let poolsPage: RawV3SubgraphPool[] = [];

          // metrics variables
          let totalPages = 0;

          do {
            totalPages += 1;

            const poolsResult = await this.client.request<{
              pools: RawV3SubgraphPool[];
            }>(query, {
              pageSize: PAGE_SIZE,
              id: lastId,
            });

            poolsPage = poolsResult.pools;

            pools = pools.concat(poolsPage);

            lastId = pools[pools.length - 1]!.id;
            metric.putMetric(
              `V3SubgraphProvider.chain_${this.chainId}.getPools.paginate.pageSize`,
              poolsPage.length
            );
          } while (poolsPage.length > 0);

          metric.putMetric(
            `V3SubgraphProvider.chain_${this.chainId}.getPools.paginate`,
            totalPages
          );
          metric.putMetric(
            `V3SubgraphProvider.chain_${this.chainId}.getPools.pools.length`,
            pools.length
          );

          return pools;
        };

        /* eslint-disable no-useless-catch */
        try {
          const getPoolsPromise = getPools();
          const timerPromise = timeout.set(this.timeout).then(() => {
            throw new Error(
              `Timed out getting pools from subgraph: ${this.timeout}`
            );
          });
          pools = await Promise.race([getPoolsPromise, timerPromise]);
          return;
        } catch (err) {
          throw err;
        } finally {
          timeout.clear();
        }
        /* eslint-enable no-useless-catch */
      },
      {
        retries: this.retries,
        onRetry: (err, retry) => {
          retries += 1;
          if (
            this.rollback &&
            blockNumber &&
            _.includes(err.message, 'indexed up to')
          ) {
            metric.putMetric(
              `V3SubgraphProvider.chain_${this.chainId}.getPools.indexError`,
              1
            );
            blockNumber = blockNumber - 10;
            log.info(
              `Detected subgraph indexing error. Rolled back block number to: ${blockNumber}`
            );
          }
          metric.putMetric(
            `V3SubgraphProvider.chain_${this.chainId}.getPools.timeout`,
            1
          );
          pools = [];
          log.info(
            { err },
            `Failed to get pools from subgraph. Retry attempt: ${retry}`
          );
        },
      }
    );

    metric.putMetric(
      `V3SubgraphProvider.chain_${this.chainId}.getPools.retries`,
      retries
    );

    const beforeFilter = Date.now();
    const poolsSanitized = pools
      .filter(
        (pool) =>
          parseInt(pool.liquidity) > 0 ||
          parseFloat(pool.totalValueLockedETH) > 0.01
      )
      .map((pool) => {
        const { totalValueLockedETH, totalValueLockedUSD, ...rest } = pool;

        return {
          ...rest,
          id: pool.id.toLowerCase(),
          token0: {
            id: pool.token0.id.toLowerCase(),
          },
          token1: {
            id: pool.token1.id.toLowerCase(),
          },
          tvlETH: parseFloat(totalValueLockedETH),
          tvlUSD: parseFloat(totalValueLockedUSD),
        };
      });

    metric.putMetric(
      `V3SubgraphProvider.chain_${this.chainId}.getPools.filter.latency`,
      Date.now() - beforeFilter
    );

    metric.putMetric(`V3SubgraphProvider.chain_${this.chainId}.getPools`, 1);
    metric.putMetric(
      `V3SubgraphProvider.chain_${this.chainId}.getPools.latency`,
      Date.now() - beforeAll
    );

    log.info(
      `Got ${pools.length} V3 pools from the subgraph. ${poolsSanitized.length} after filtering`
    );

    return poolsSanitized;
  }
}
