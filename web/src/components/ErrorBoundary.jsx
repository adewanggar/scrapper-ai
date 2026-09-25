import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          maxWidth: '560px',
          margin: '40px auto',
          textAlign: 'center',
          background: 'var(--color-bg-card, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)', marginBottom: '8px' }}>
            Terjadi Kendala Memuat Tampilan
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary, #64748b)', marginBottom: '20px', lineHeight: 1.5 }}>
            Data hasil analisis mungkin memiliki struktur yang belum sinkron atau terputus: <br />
            <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#e11d48', display: 'inline-block', marginTop: '6px' }}>
              {this.state.error?.message || 'Kesalahan rendering komponen'}
            </code>
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              className="btn btn-scrape-primary"
              style={{ padding: '0 18px', height: '38px', fontSize: '13px' }}
            >
              <RefreshCw size={15} />
              <span>Coba Tampilkan Ulang</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-white-bordered"
              style={{ padding: '0 18px', height: '38px', fontSize: '13px' }}
            >
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
