import { useEffect, useState } from 'react';
import './App.css';

interface TrackingData {
  tracking_number: string;
  order_number: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SearchResponse {
  results: TrackingData[];
  count: number;
}

// Get the worker URL from environment variables
const WORKER_URL = import.meta.env.VITE_WORKER_URL;


function App() {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideDelivered, setHideDelivered] = useState(false);

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`${WORKER_URL}/search`);
      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }
      const data: SearchResponse = await response.json();
      setTrackingData(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = hideDelivered
    ? trackingData.filter(item => item.status.toLowerCase() !== 'delivered')
    : trackingData;

  if (loading) {
    return <div className="loading">Loading tracking data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>USPS Tracking Status</h1>
      <div className="filter-controls">
        <label>
          <input
            type="checkbox"
            checked={hideDelivered}
            onChange={(e) => setHideDelivered(e.target.checked)}
          />
          Hide Delivered Packages
        </label>
        <div className="total-count">
          Showing {filteredData.length} of {trackingData.length} packages
        </div>
      </div>
      <div className="tracking-grid">
        <div className="grid-header">
          <div>Tracking Number</div>
          <div>Order Number</div>
          <div>Status</div>
          <div>Created At</div>
          <div>Updated At</div>
        </div>
        {filteredData.map((item) => (
          <div key={item.tracking_number} className="grid-row">
            <div>{item.tracking_number}</div>
            <div>{item.order_number || 'N/A'}</div>
            <div>{item.status}</div>
            <div>{new Date(item.created_at).toLocaleString()}</div>
            <div>{new Date(item.updated_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
