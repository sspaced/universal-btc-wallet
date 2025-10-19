import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

export interface AddressBookEntry {
  id: string;
  name: string;
  address: string;
  memo?: string;
  createdAt: Date;
  lastUsed?: Date;
}

interface AddressBookProps {
  onSelectAddress: (address: string, name: string) => void;
  onClose: () => void;
  className?: string;
}

export const AddressBook: React.FC<AddressBookProps> = ({
  onSelectAddress,
  onClose,
  className = ''
}) => {
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    address: '',
    memo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load address book from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('wallet-address-book');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        setEntries(parsed.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          lastUsed: entry.lastUsed ? new Date(entry.lastUsed) : undefined
        })));
      } catch (error) {
        console.error('Failed to parse address book:', error);
      }
    }
  }, []);

  // Save address book to localStorage
  const saveEntries = (newEntries: AddressBookEntry[]) => {
    localStorage.setItem('wallet-address-book', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  // Validate Bitcoin address
  const isValidAddress = (address: string): boolean => {
    const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
    const p2shRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return bech32Regex.test(address) || p2shRegex.test(address);
  };

  const handleAddEntry = () => {
    if (!newEntry.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    if (!newEntry.address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    if (!isValidAddress(newEntry.address.trim())) {
      toast.error('Invalid Bitcoin address');
      return;
    }

    // Check for duplicate address
    if (entries.some(entry => entry.address === newEntry.address.trim())) {
      toast.error('This address is already in your address book');
      return;
    }

    const entry: AddressBookEntry = {
      id: Date.now().toString(),
      name: newEntry.name.trim(),
      address: newEntry.address.trim(),
      memo: newEntry.memo.trim() || undefined,
      createdAt: new Date()
    };

    const newEntries = [entry, ...entries];
    saveEntries(newEntries);

    setNewEntry({ name: '', address: '', memo: '' });
    setIsAddingNew(false);
    toast.success('Address added to address book');
  };

  const handleSelectEntry = (entry: AddressBookEntry) => {
    // Update last used timestamp
    const updatedEntries = entries.map(e =>
      e.id === entry.id ? { ...e, lastUsed: new Date() } : e
    );
    saveEntries(updatedEntries);

    onSelectAddress(entry.address, entry.name);
    toast.success(`Selected ${entry.name}`);
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(e => e.id !== entryId);
    saveEntries(updatedEntries);
    toast.success('Address removed from address book');
  };

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.memo && entry.memo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const sortedEntries = filteredEntries.sort((a, b) => {
    // Sort by last used (most recent first), then by creation date
    if (a.lastUsed && b.lastUsed) {
      return b.lastUsed.getTime() - a.lastUsed.getTime();
    }
    if (a.lastUsed && !b.lastUsed) return -1;
    if (!a.lastUsed && b.lastUsed) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <Card padding="lg" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
          Address Book
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <CrossIcon className="w-5 h-5" style={{ color: 'var(--apple-secondary-label)' }} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-xl border-0 text-sm"
          style={{
            backgroundColor: 'var(--apple-gray-6)',
            color: 'var(--apple-label)'
          }}
        />
      </div>

      {/* Add New Button */}
      <div className="mb-4">
        <Button
          variant="secondary"
          size="medium"
          fullWidth
          onClick={() => setIsAddingNew(!isAddingNew)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          {isAddingNew ? 'Cancel' : 'Add New Contact'}
        </Button>
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-gray-6)' }}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--apple-label)' }}>
                Name
              </label>
              <input
                type="text"
                value={newEntry.name}
                onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                placeholder="Contact name"
                className="w-full p-3 rounded-lg border-0 text-sm"
                style={{
                  backgroundColor: 'var(--apple-system-background)',
                  color: 'var(--apple-label)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--apple-label)' }}>
                Bitcoin Address
              </label>
              <input
                type="text"
                value={newEntry.address}
                onChange={(e) => setNewEntry({ ...newEntry, address: e.target.value })}
                placeholder="bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"
                className="w-full p-3 rounded-lg border-0 text-sm font-mono"
                style={{
                  backgroundColor: 'var(--apple-system-background)',
                  color: 'var(--apple-label)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--apple-label)' }}>
                Memo <span className="font-normal" style={{ color: 'var(--apple-secondary-label)' }}>(Optional)</span>
              </label>
              <input
                type="text"
                value={newEntry.memo}
                onChange={(e) => setNewEntry({ ...newEntry, memo: e.target.value })}
                placeholder="Notes about this contact"
                className="w-full p-3 rounded-lg border-0 text-sm"
                style={{
                  backgroundColor: 'var(--apple-system-background)',
                  color: 'var(--apple-label)'
                }}
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <Button variant="tertiary" size="small" onClick={() => setIsAddingNew(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" size="small" onClick={handleAddEntry} className="flex-1">
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-8">
            <ContactIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--apple-secondary-label)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--apple-label)' }}>
              {searchTerm ? 'No contacts found' : 'No saved contacts'}
            </p>
            <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
              {searchTerm ? 'Try a different search term' : 'Add your first contact to get started'}
            </p>
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => handleSelectEntry(entry)}
              style={{ backgroundColor: 'var(--apple-gray-6)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-blue)' }}>
                    <span className="text-white font-semibold text-sm">
                      {entry.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--apple-label)' }}>
                      {entry.name}
                    </p>
                    <p className="text-sm font-mono truncate" style={{ color: 'var(--apple-secondary-label)' }}>
                      {formatAddress(entry.address)}
                    </p>
                    {entry.memo && (
                      <p className="text-xs truncate italic mt-1" style={{ color: 'var(--apple-secondary-label)' }}>
                        {entry.memo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEntry(entry.id);
                }}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>

      {sortedEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--apple-separator)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--apple-secondary-label)' }}>
            {sortedEntries.length} contact{sortedEntries.length !== 1 ? 's' : ''} in your address book
          </p>
        </div>
      )}
    </Card>
  );
};

// Utility function to add address to address book (can be called from other components)
export const addToAddressBook = (name: string, address: string, memo?: string): boolean => {
  try {
    const savedEntries = localStorage.getItem('wallet-address-book');
    let entries: AddressBookEntry[] = [];

    if (savedEntries) {
      entries = JSON.parse(savedEntries);
    }

    // Check for duplicate
    if (entries.some(entry => entry.address === address)) {
      return false; // Already exists
    }

    const newEntry: AddressBookEntry = {
      id: Date.now().toString(),
      name,
      address,
      memo,
      createdAt: new Date()
    };

    entries.unshift(newEntry);
    localStorage.setItem('wallet-address-book', JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Failed to add to address book:', error);
    return false;
  }
};

// Icon Components
const CrossIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ContactIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TrashIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);