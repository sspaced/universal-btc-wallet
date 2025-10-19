import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export interface FilterOptions {
  type: 'all' | 'sent' | 'received' | 'pending';
  status: 'all' | 'confirmed' | 'pending' | 'failed';
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  minAmount?: string;
  maxAmount?: string;
  address?: string;
  searchTerm?: string;
}

interface TransactionFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport?: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      status: 'all',
      dateRange: 'all',
      minAmount: '',
      maxAmount: '',
      address: '',
      searchTerm: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.type !== 'all' ||
           filters.status !== 'all' ||
           filters.dateRange !== 'all' ||
           filters.minAmount ||
           filters.maxAmount ||
           filters.address ||
           filters.searchTerm;
  };

  return (
    <Card padding="lg">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search transactions, addresses, or memos..."
          value={filters.searchTerm || ''}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="w-full p-3 rounded-xl border-0 text-sm"
          style={{
            backgroundColor: 'var(--apple-gray-6)',
            color: 'var(--apple-label)'
          }}
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'sent', label: 'Sent' },
          { key: 'received', label: 'Received' }
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => updateFilter('type', option.key as any)}
            className="p-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: filters.type === option.key ? 'var(--apple-blue)' : 'var(--apple-gray-6)',
              color: filters.type === option.key ? 'white' : 'var(--apple-label)'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium"
          style={{ color: 'var(--apple-blue)' }}
        >
          {showAdvanced ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="flex space-x-2">
          {hasActiveFilters() && (
            <Button variant="tertiary" size="small" onClick={clearFilters}>
              Clear
            </Button>
          )}
          {onExport && (
            <Button variant="secondary" size="small" onClick={onExport}>
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--apple-separator)' }}>
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
              Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'pending', label: 'Pending' },
                { key: 'failed', label: 'Failed' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => updateFilter('status', option.key as any)}
                  className="p-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: filters.status === option.key ? 'var(--apple-blue)' : 'var(--apple-gray-6)',
                    color: filters.status === option.key ? 'white' : 'var(--apple-label)'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
              Date Range
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'all', label: 'All Time' },
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => updateFilter('dateRange', option.key as any)}
                  className="p-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: filters.dateRange === option.key ? 'var(--apple-blue)' : 'var(--apple-gray-6)',
                    color: filters.dateRange === option.key ? 'white' : 'var(--apple-label)'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
                Min Amount (BTC)
              </label>
              <input
                type="number"
                placeholder="0.00000000"
                step="0.00000001"
                value={filters.minAmount || ''}
                onChange={(e) => updateFilter('minAmount', e.target.value)}
                className="w-full p-3 rounded-xl border-0 text-sm font-mono"
                style={{
                  backgroundColor: 'var(--apple-gray-6)',
                  color: 'var(--apple-label)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
                Max Amount (BTC)
              </label>
              <input
                type="number"
                placeholder="0.00000000"
                step="0.00000001"
                value={filters.maxAmount || ''}
                onChange={(e) => updateFilter('maxAmount', e.target.value)}
                className="w-full p-3 rounded-xl border-0 text-sm font-mono"
                style={{
                  backgroundColor: 'var(--apple-gray-6)',
                  color: 'var(--apple-label)'
                }}
              />
            </div>
          </div>

          {/* Address Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
              Address
            </label>
            <input
              type="text"
              placeholder="Bitcoin address or partial address..."
              value={filters.address || ''}
              onChange={(e) => updateFilter('address', e.target.value)}
              className="w-full p-3 rounded-xl border-0 text-sm font-mono"
              style={{
                backgroundColor: 'var(--apple-gray-6)',
                color: 'var(--apple-label)'
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};