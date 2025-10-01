import { useEffect, useState } from 'react';
import './App.css';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  scheduled_date: string;
  recipient: string;
  status: string;
  isWithin24Hours?: boolean;
}

interface PaymentsResponse {
  payments: Payment[];
  count: number;
  totalAmount: number;
  currency: string;
  dataSource: string;
}

function App() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientFilter, setRecipientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [dateFilterType, setDateFilterType] = useState<'after' | 'before'>('after');
  const [totalAmount, setTotalAmount] = useState(0);
  const [dataSource, setDataSource] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (recipientFilter) params.append('recipient', recipientFilter);
      if (dateFilter) params.append(dateFilterType, dateFilter);

      const response = await fetch(`${API_BASE_URL}/payments?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data: PaymentsResponse = await response.json();
      setPayments(data.payments);
      setTotalAmount(data.totalAmount);
      setDataSource(data.dataSource);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce the API call to avoid too many requests and focus issues
    const timeoutId = setTimeout(() => {
      fetchPayments();
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [recipientFilter, dateFilter, dateFilterType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const clearAllFilters = async () => {
    // Clear all filter states
    setRecipientFilter('');
    setDateFilter('');
    setDateFilterType('after');
    
    // Fetch all payments (no filters applied)
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payments`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data: PaymentsResponse = await response.json();
      setPayments(data.payments);
      setTotalAmount(data.totalAmount);
      setDataSource(data.dataSource);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="App"><div className="loading">Loading payments...</div></div>;
  }

  if (error) {
    return <div className="App"><div className="error">Error: {error}</div></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Payments History</h1>
        <p>Data Source: {dataSource}</p>
      </header>

      <main className="App-main">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="recipient">Filter by Recipient:</label>
            <input
              id="recipient"
              type="text"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              placeholder="Enter recipient name"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="dateType">Date Filter:</label>
            <select
              id="dateType"
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value as 'after' | 'before')}
            >
              <option value="after">After</option>
              <option value="before">Before</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="date">Date:</label>
            <input
              id="date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder={`Select date to filter ${dateFilterType}`}
            />
          </div>
          <div className="filter-group">
            <button 
              className="clear-filters-btn"
              onClick={clearAllFilters}
              type="button"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="summary">
          <p>Total: {formatCurrency(totalAmount)} ({payments.length} payments)</p>
        </div>

        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Scheduled Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr 
                  key={payment.id} 
                  className={payment.isWithin24Hours ? 'highlight-24h' : ''}
                >
                  <td>{payment.id}</td>
                  <td>{payment.recipient}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{formatDate(payment.scheduled_date)}</td>
                  <td>
                    <span className={`status status-${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="no-payments">
            No pending payments found.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
