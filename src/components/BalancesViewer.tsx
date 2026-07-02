import { useState } from 'react';
import type { FormEvent } from 'react';

interface TokenBalance {
    chain: string;
    chain_id: number;
    address: string;
    amount: string;
    symbol?: string;
    name?: string;
    decimals?: number;
    price_usd?: number;
    value_usd?: number;
    low_liquidity?: boolean;
}

function formatAmount(amount: string, decimals?: number): string {
    if (decimals === undefined) return amount;
    const value = Number(amount) / 10 ** decimals;
    if (!Number.isFinite(value)) return amount;
    return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function formatUsd(value?: number): string {
    if (value === undefined || !Number.isFinite(value)) return '—';
    return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default function BalancesViewer() {
    const [address, setAddress] = useState('');
    const [balances, setBalances] = useState<TokenBalance[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchBalances = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setBalances(null);
        try {
            const response = await fetch(`/api/balances?address=${encodeURIComponent(address.trim())}`);
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || `Request failed with status ${response.status}`);
            } else {
                setBalances(data.balances ?? []);
            }
        } catch {
            setError('Failed to fetch balances');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={fetchBalances} className="flex flex-wrap gap-4 mb-8">
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x wallet address"
                    className="flex-1 min-w-64 px-4 py-3 text-gray-900 bg-white rounded-sm"
                    pattern="0x[a-fA-F0-9]{40}"
                    title="0x-prefixed EVM address (40 hex characters)"
                    required
                />
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Loading...' : 'Get Balances'}
                </button>
            </form>

            {error && <p className="mb-8 text-red-400">{error}</p>}

            {balances && balances.length === 0 && <p>No token balances found for this address.</p>}

            {balances && balances.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-white/20">
                                <th className="px-3 py-2">Token</th>
                                <th className="px-3 py-2">Chain</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                                <th className="px-3 py-2 text-right">Price (USD)</th>
                                <th className="px-3 py-2 text-right">Value (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {balances.map((balance) => (
                                <tr key={`${balance.chain_id}-${balance.address}`} className="border-b border-white/10">
                                    <td className="px-3 py-2">
                                        {balance.symbol || balance.address}
                                        {balance.low_liquidity && <span className="ml-2 text-xs text-yellow-400">(low liquidity)</span>}
                                    </td>
                                    <td className="px-3 py-2">{balance.chain}</td>
                                    <td className="px-3 py-2 text-right">{formatAmount(balance.amount, balance.decimals)}</td>
                                    <td className="px-3 py-2 text-right">{formatUsd(balance.price_usd)}</td>
                                    <td className="px-3 py-2 text-right">{formatUsd(balance.value_usd)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
