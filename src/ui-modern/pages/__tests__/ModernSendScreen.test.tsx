import { render, screen } from '@testing-library/react';

import { ModernSendScreen } from '../ModernSendScreen';

// Mock des hooks nécessaires
jest.mock('@/ui/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

jest.mock('@/ui/pages/MainRoute', () => ({
  useNavigate: () => jest.fn()
}));

jest.mock('@/ui/state/accounts/hooks', () => ({
  useAccountBalance: () => ({
    availableBalance: 100000000, // 1 BTC en satoshis
    unavailableBalance: 0
  })
}));

jest.mock('@/ui/state/settings/hooks', () => ({
  useBTCUnit: () => 'BTC',
  useChain: () => ({
    icon: '/chain-icon.png',
    enum: 'mainnet'
  }),
  useWalletConfig: () => ({
    disableUtxoTools: false
  })
}));

jest.mock('@/ui/state/transactions/hooks', () => ({
  useBitcoinTx: () => ({}),
  useFetchUtxosCallback: () => jest.fn(),
  usePrepareSendBTCCallback: () => jest.fn()
}));

jest.mock('@/ui/state/ui/hooks', () => ({
  useUiTxCreateScreen: () => ({
    toInfo: { address: '' },
    inputAmount: '',
    enableRBF: false,
    feeRate: 5
  }),
  useUpdateUiTxCreateScreen: () => jest.fn()
}));

jest.mock('@/ui/hooks/useUtxoTools', () => ({
  useUtxoTools: () => ({
    openUtxoTools: jest.fn()
  })
}));

jest.mock('@/ui/components/ActionComponent', () => ({
  useTools: () => ({
    showLoading: jest.fn()
  })
}));

describe('ModernSendScreen', () => {
  it('renders without crashing', () => {
    render(<ModernSendScreen />);

    // Vérifier que les éléments principaux sont présents
    expect(screen.getByText('send BTC')).toBeInTheDocument();
    expect(screen.getByText('recipient_address')).toBeInTheDocument();
    expect(screen.getByText('transfer_amount')).toBeInTheDocument();
    expect(screen.getByText('Network Fee')).toBeInTheDocument();
    expect(screen.getByText('Replace-By-Fee (RBF)')).toBeInTheDocument();
  });

  it('displays balance information', () => {
    render(<ModernSendScreen />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('1 BTC')).toBeInTheDocument();
  });

  it('shows fee options', () => {
    render(<ModernSendScreen />);

    expect(screen.getByText('Slow')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Fast')).toBeInTheDocument();
  });
});
