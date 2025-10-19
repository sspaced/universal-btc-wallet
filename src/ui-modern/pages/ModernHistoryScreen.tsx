import BigNumber from 'bignumber.js';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { runesUtils } from '@/shared/lib/runes-utils';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountAddress } from '@/ui/state/accounts/hooks';
import { satoshisToBTC, shortAddress, useWallet } from '@/ui/utils';
import { useTranslation } from 'react-i18next';
import { ModernHeader } from '../components/layout/ModernHeader';

interface ExtraItem {
  ticker: string;
  value: BigNumber;
  symbol: string;
  type: 'BRC20' | 'RUNES' | 'BTC';
  div: number;
}

export interface HistoryItem {
  txid: string;
  address: string;
  type: 'receive' | 'send';
  btcAmount: number;
  extra: ExtraItem[];
  confirmations: number;
  feeRate: number;
  fee: number;
  outputValue: number;
  timestamp: number;
}

interface GroupItem {
  date: string;
  historyItems: HistoryItem[];
  index: number;
}

function AmountItem({ item }: { item: ExtraItem }) {
  const isReceived = item.value.isPositive();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
      <span style={{ fontSize: '13px', color: isReceived ? '#34c759' : '#ff453a', fontWeight: '600' }}>
        {isReceived ? '+' : '-'}
      </span>
      {item.type === 'BTC' && (
        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>
          {Number(item.value.abs().toNumber()).toLocaleString('en', { minimumFractionDigits: 8 })}
        </span>
      )}
      {item.type === 'BRC20' && (
        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>
          {item.value.abs().toString()}
        </span>
      )}
      {item.type === 'RUNES' && (
        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>
          {runesUtils.toDecimalAmount(item.value.abs().toString(), item.div)}
        </span>
      )}
      <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
        {item.symbol || item.ticker}
      </span>
    </div>
  );
}

const pageSize = 20;

export const ModernHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const address = useAccountAddress();
  const wallet = useWallet();
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [historyGroups, setHistoryGroups] = useState<GroupItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setLoading(true);
      setHistoryGroups([]);
      wallet
        .getAddressHistory({ address, start: (page - 1) * pageSize, limit: pageSize })
        .then((res) => {
          const _historyGroups: GroupItem[] = [];
          let lastDate = '';
          let lastGroup: GroupItem;
          let index = 0;
          res.detail.forEach((v) => {
            const date = new Date(v.timestamp * 1000).toLocaleDateString();
            if (lastDate != date) {
              lastDate = date;
              lastGroup = { date, historyItems: [], index: index++ };
              _historyGroups.push(lastGroup);
            }

            let btcAmount = new BigNumber(0);
            const assetMap: { [key: string]: ExtraItem } = {};

            let fromAddress = '';
            let toAddress = '';

            v.vin.forEach((vin) => {
              if (vin.address === address) {
                btcAmount = btcAmount.minus(vin.value);
                if (vin.brc20) {
                  vin.brc20.forEach((b) => {
                    if (!assetMap[b.ticker]) {
                      assetMap[b.ticker] = {
                        ticker: b.ticker,
                        value: new BigNumber(0),
                        type: 'BRC20',
                        symbol: '',
                        div: 0
                      };
                    }
                    assetMap[b.ticker].value = assetMap[b.ticker].value.minus(b.amount);
                  });
                }

                if (vin.runes) {
                  vin.runes.forEach((r) => {
                    if (!assetMap[r.spacedRune]) {
                      assetMap[r.spacedRune] = {
                        ticker: r.spacedRune,
                        value: new BigNumber(0),
                        type: 'RUNES',
                        symbol: r.symbol,
                        div: r.divisibility
                      };
                    }
                    assetMap[r.spacedRune].value = assetMap[r.spacedRune].value.minus(r.amount);
                  });
                }
              } else {
                fromAddress = vin.address;
              }
            });

            v.vout.forEach((vout) => {
              if (vout.address === address) {
                btcAmount = btcAmount.plus(vout.value);
                if (vout.brc20) {
                  vout.brc20.forEach((b) => {
                    if (!assetMap[b.ticker]) {
                      assetMap[b.ticker] = {
                        ticker: b.ticker,
                        value: new BigNumber(0),
                        type: 'BRC20',
                        symbol: '',
                        div: 0
                      };
                    }
                    assetMap[b.ticker].value = assetMap[b.ticker].value.plus(b.amount);
                  });
                }
                if (vout.runes) {
                  vout.runes.forEach((r) => {
                    if (!assetMap[r.spacedRune]) {
                      assetMap[r.spacedRune] = {
                        ticker: r.spacedRune,
                        value: new BigNumber(0),
                        type: 'RUNES',
                        symbol: r.symbol,
                        div: r.divisibility
                      };
                    }
                    assetMap[r.spacedRune].value = assetMap[r.spacedRune].value.plus(r.amount);
                  });
                }
              } else {
                toAddress = vout.address;
              }
            });

            const extra: ExtraItem[] = [];
            for (const assetMapKey in assetMap) {
              const item = assetMap[assetMapKey];
              extra.push(item);
            }

            lastGroup.historyItems.push({
              txid: v.txid,
              address: (btcAmount.isPositive() ? fromAddress : toAddress) || address,
              type: btcAmount.isPositive() ? 'receive' : 'send',
              btcAmount: satoshisToBTC(btcAmount.toNumber()),
              extra,
              confirmations: v.confirmations,
              feeRate: v.feeRate,
              fee: v.fee,
              outputValue: v.outputValue,
              timestamp: v.timestamp * 1000
            });
          });

          setTotal(res.total);
          setHistoryGroups(_historyGroups);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [address, page]);

  const handleItemClick = (item: HistoryItem) => {
    navigate('ModernHistoryDetail', item);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        display: 'flex',
        flexDirection: 'column'
      }}>
      {/* Header */}
      <ModernHeader
        title={t('history')}
        onBack={() => navigate('MainScreen')}
        showBackButton={true}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0'
        }}>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Loading...</span>
          </div>
        ) : historyGroups.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '60px 20px'
            }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(255, 255, 255, 0.05)" />
              <path
                d="M24 14v10l6 6"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
              This account has no transactions
            </span>
          </div>
        ) : (
          <div>
            {historyGroups.map((group, groupIndex) => (
              <div key={groupIndex} style={{ marginBottom: '24px' }}>
                {/* Date Header */}
                <div
                  style={{
                    padding: '12px 20px',
                    position: 'sticky',
                    top: 0,
                    background: '#121212',
                    zIndex: 1
                  }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600' }}>
                    {group.date}
                  </span>
                </div>

                {/* Transaction Items */}
                {group.historyItems.map((item, itemIndex) => {
                  const isReceived = item.type === 'receive';
                  return (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleItemClick(item)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                      {/* Left: Icon and Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        {/* Icon */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: isReceived
                              ? 'rgba(52, 199, 89, 0.15)'
                              : 'rgba(255, 69, 58, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            {isReceived ? (
                              <path
                                d="M10 4v12m0 0l-4-4m4 4l4-4"
                                stroke="#34c759"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ) : (
                              <path
                                d="M10 16V4m0 0L6 8m4-4l4 4"
                                stroke="#ff453a"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                          </svg>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>
                            {isReceived ? 'Receive' : 'Send'}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'rgba(255, 255, 255, 0.5)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                            {isReceived ? 'From' : 'To'} {shortAddress(item.address)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Amount */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                        <AmountItem
                          item={{
                            ticker: 'BTC',
                            value: new BigNumber(item.btcAmount),
                            type: 'BTC',
                            div: 0,
                            symbol: 'BTC'
                          }}
                        />
                        {item.extra.map((extraItem, index) => (
                          <AmountItem key={index} item={extraItem} />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}

            {/* Pagination */}
            {total > pageSize && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '24px 20px'
                }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: page === 1 ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                  Previous
                </button>
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Page {page} of {Math.ceil(total / pageSize)}
                </span>
                <button
                  onClick={() => setPage(Math.min(Math.ceil(total / pageSize), page + 1))}
                  disabled={page >= Math.ceil(total / pageSize)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: page >= Math.ceil(total / pageSize) ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
                    cursor: page >= Math.ceil(total / pageSize) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
