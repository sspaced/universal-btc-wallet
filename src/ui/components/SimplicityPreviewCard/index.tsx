import { SimplicityAddressBalance, TickPriceItem } from '@/shared/types';
import { TickUsd, TickUsdWithoutPrice, TokenType } from '@/ui/components/TickUsd';
import { colors } from '@/ui/theme/colors';

import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';

export interface SimplicityPreviewCardProps {
  balance: SimplicityAddressBalance;
  onClick?: () => void;
  price?: TickPriceItem;
}

export default function SimplicityPreviewCard({ balance, onClick, price }: SimplicityPreviewCardProps) {
  const balanceAmount = balance.overall_balance;

  let balanceSize = 'xxl';
  if (balanceAmount.length < 7) {
    balanceSize = 'md';
  } else if (balanceAmount.length < 14) {
    balanceSize = 'md';
  } else if (balanceAmount.length < 21) {
    balanceSize = 'md';
  } else {
    balanceSize = 'sm';
  }

  return (
    <Column
      style={{
        backgroundColor: colors.bg4,
        minWidth: 80,
        minHeight: 90,
        borderRadius: 5,
        borderWidth: 0,
        borderColor: colors.primary
      }}
      gap="zero"
      onClick={onClick}>
      <Row
        style={{
          backgroundColor: '#8B5CF6',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}>
        <Row
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderBottomRightRadius: 5,
            borderTopLeftRadius: 5
          }}
          px="sm">
          <Text
            text={balance.ticker}
            size="sm"
            style={{
              color: '#ffffff',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          />
        </Row>
      </Row>
      <Column
        style={{
          height: 60,
          backgroundColor: '#8B5CF6'
        }}
        justifyCenter
        itemsCenter
        gap={'xs'}>
        <Text text={balanceAmount} size={balanceSize as any} textCenter wrap digital style={{ color: '#ffffff' }} />
        {price ? (
          <TickUsd price={price} balance={balanceAmount} />
        ) : (
          <TickUsdWithoutPrice tick={balance.ticker} balance={balanceAmount} type={TokenType.SIMPLICITY} />
        )}
      </Column>

      <Column px="sm" pb="sm" gap="sm" py="sm">
        <Row itemsCenter justifyCenter>
          <Text text={`Block ${balance.block_height}`} color="primary" size="xs" />
        </Row>
      </Column>
    </Column>
  );
}
