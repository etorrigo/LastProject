import React from 'react';

export default function Header({ 
  connectionStatus, 
  onToggleConnection, 
  voltage, 
  latency 
}) {
  const getButtonContent = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <>
            <span className="beacon-wrapper">
              <span className="beacon-ping connecting"></span>
              <span className="beacon-dot connecting"></span>
            </span>
            <span>PAREANDO OBD...</span>
          </>
        );
      case 'connected':
        return (
          <>
            <span className="beacon-wrapper">
              <span className="beacon-ping connected"></span>
              <span className="beacon-dot connected"></span>
            </span>
            <span>ECU ONLINE</span>
          </>
        );
      default:
        return (
          <>
            <span className="beacon-wrapper">
              <span className="beacon-dot disconnected"></span>
            </span>
            <span>CONECTAR OBD/ECU</span>
          </>
        );
    }
  };

  return (
    <header className="hmi-header">
      <div className="header-inner">
        
        {/* Brand & Metadados */}
        <div className="brand-section">
          <div className="brand-icon">⚡</div>
          <div className="brand-text">
            <h1>
              ECU CALIBRATION HMI
              <span className="badge-version">REACT v2.4</span>
            </h1>
            <p className="protocol-desc">PROTOCOLO: ISO 15765-4 (CAN 500K/11b)</p>
          </div>
        </div>

        {/* Vitals & Ação de Conexão */}
        <div className="header-actions">
          <div className="vital-chip">
            <span className="vital-label">BATERIA:</span>
            <span className="vital-val tnum">{voltage}V</span>
          </div>

          <div className="vital-chip" style={{ display: latency ? 'flex' : 'none' }}>
            <span className="vital-label">TX/RX:</span>
            <span className="vital-val tnum" style={{ color: '#cbd5e1' }}>{latency}ms</span>
          </div>

          <button
            onClick={onToggleConnection}
            className={`btn-bluetooth ${connectionStatus}`}
          >
            {getButtonContent()}
          </button>
        </div>

      </div>
    </header>
  );
}
