import React from 'react';

export default function DiagnosticScanner({
  dtcs,
  isScanning,
  onScan,
  onClear,
  onRemoveCode,
  onExportCSV,
  logs
}) {
  return (
    <section className="glass-card scanner-panel">
      
      {/* Barra de Ferramentas / Cabeçalho */}
      <div className="scanner-toolbar">
        <div className="scanner-heading">
          <div className="scanner-square"></div>
          <h2>SCANNER DE DIAGNÓSTICO DA ECU (DTC RECORDER)</h2>
          <span className={`dtc-pill-count ${dtcs.length === 0 ? 'zero' : ''}`}>
            {dtcs.length} FALHAS
          </span>
        </div>

        <div className="scanner-actions">
          <button 
            onClick={onScan} 
            disabled={isScanning}
            className="btn-action scan"
          >
            {isScanning ? (
              <>
                <div className="spinner-icon"></div>
                <span>VARRENDO ECU...</span>
              </>
            ) : (
              <span>🔍 INICIAR VARREDURA (SCAN)</span>
            )}
          </button>

          <button 
            onClick={onClear} 
            className="btn-action clear"
          >
            🧹 LIMPAR BUFFER (CLEAR)
          </button>

          <button 
            onClick={onExportCSV} 
            className="btn-action export"
          >
            📥 EXPORTAR CSV
          </button>
        </div>
      </div>

      {/* Tabela de DTCs */}
      <div className="table-wrapper">
        <table className="dtc-table">
          <thead>
            <tr>
              <th>HORÁRIO</th>
              <th>CÓDIGO (DTC)</th>
              <th>SUBSISTEMA</th>
              <th>DESCRIÇÃO DA FALHA</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>AÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {dtcs.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  Nenhuma falha ativa registrada no buffer da ECU. Conecte o módulo e execute uma varredura.
                </td>
              </tr>
            ) : (
              dtcs.map((dtc) => (
                <tr key={dtc.code}>
                  <td style={{ color: '#94a3b8' }}>{dtc.timestamp}</td>
                  <td className={`dtc-code-cell ${dtc.severity}`}>
                    {dtc.code}
                  </td>
                  <td>{dtc.system}</td>
                  <td>{dtc.desc}</td>
                  <td>
                    <span className={`severity-tag ${dtc.severity}`}>
                      {dtc.severity === 'critical' ? 'CRÍTICA' : 'PENDENTE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onRemoveCode(dtc.code)}
                      className="btn-remove-code"
                      title="Excluir falha individual"
                    >
                      ✕ Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Console CAN-Bus em Tempo Real */}
      <div className="can-terminal">
        <div className="terminal-header">
          <span>CONSOLE DE COMUNICAÇÃO CAN-BUS EM TEMPO REAL</span>
          <span className="terminal-feed-status">● FEED ATIVO</span>
        </div>
        <div className="terminal-logs">
          {logs.map((log, index) => (
            <div key={index} className={`log-line ${log.color || ''}`}>
              <span className="log-time">[{log.time}]</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
