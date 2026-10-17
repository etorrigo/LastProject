import React from 'react';

export default function TelemetryGrid({ telemetry, peakRpm }) {
  const isRedline = telemetry.rpm >= 6400;
  const rpmPct = Math.min((telemetry.rpm / 7500) * 100, 100);
  
  // Mapeamento escala de turbo boost (-0.8 a 2.5 bar)
  const boostPct = Math.max(0, Math.min(100, ((telemetry.boost + 0.8) / 3.3) * 100));
  
  // Posição de ponto Lambda (0.80 a 1.20)
  const lambdaPos = Math.max(0, Math.min(100, ((telemetry.lambda - 0.80) / 0.40) * 100));

  // Estado semântico de temperatura
  const isTempCritical = telemetry.ect > 105;

  return (
    <section>
      <div className="section-header">
        <h2 className="section-title">
          <span className="dot-indicator"></span> PARÂMETROS CRÍTICOS EM TEMPO REAL
        </h2>
        <span className="sampling-rate">FREQ. AMOSTRAGEM: 10 HZ</span>
      </div>

      <div className="telemetry-grid">

        {/* CARD 1: ROTAÇÃO DO MOTOR (RPM) */}
        <div className={`glass-card ${isRedline ? 'pulse-danger' : ''}`}>
          <div className="card-header">
            <span className="card-label">ROTAÇÃO MOTOR</span>
            <span className="card-badge">PICO: <strong style={{ color: '#e2e8f0' }}>{peakRpm}</strong></span>
          </div>

          <div className="metric-row">
            <span className={`metric-value ${isRedline ? 'danger' : ''} tnum`}>
              {telemetry.rpm}
            </span>
            <span className="metric-unit">RPM</span>
          </div>

          <div>
            <div className="progress-track">
              <div 
                className="progress-bar rpm" 
                style={{ width: `${rpmPct}%` }}
              ></div>
            </div>
            <div className="progress-scale">
              <span>0</span>
              <span>4500</span>
              <span style={{ color: '#f87171' }}>7500</span>
            </div>
          </div>
        </div>

        {/* CARD 2: PRESSÃO DO TURBO / MAP */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-label">PRESSÃO TURBO (MAP)</span>
            <span className="card-badge">TARGET: 1.50</span>
          </div>

          <div className="metric-row">
            <span className="metric-value boost tnum">
              {telemetry.boost.toFixed(2)}
            </span>
            <span className="metric-unit">BAR</span>
          </div>

          <div>
            <div className="progress-track">
              <div 
                className="progress-bar boost" 
                style={{ width: `${boostPct}%` }}
              ></div>
            </div>
            <div className="progress-scale">
              <span>-0.8</span>
              <span>1.0</span>
              <span>2.5</span>
            </div>
          </div>
        </div>

        {/* CARD 3: TEMPERATURA ÁGUA & ÓLEO */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-label">TEMPERATURA ARREF. / ÓLEO</span>
            <span className={`card-badge ${isTempCritical ? 'critical' : 'optimal'}`}>
              {isTempCritical ? 'CRÍTICO' : 'NOMINAL'}
            </span>
          </div>

          <div className="dual-temp-row">
            <div className="temp-col">
              <span className="temp-sublabel">ECT (ÁGUA)</span>
              <div className="metric-row" style={{ margin: '0.25rem 0' }}>
                <span className="metric-value tnum" style={{ color: isTempCritical ? '#f87171' : '#34d399', fontSize: '2rem' }}>
                  {telemetry.ect}
                </span>
                <span className="metric-unit">°C</span>
              </div>
            </div>

            <div className="divider-vertical"></div>

            <div className="temp-col">
              <span className="temp-sublabel">EOT (ÓLEO)</span>
              <div className="metric-row" style={{ margin: '0.25rem 0' }}>
                <span className="metric-value tnum" style={{ fontSize: '2rem' }}>
                  {telemetry.eot}
                </span>
                <span className="metric-unit">°C</span>
              </div>
            </div>
          </div>

          <div className="progress-track" style={{ height: '6px' }}>
            <div 
              className="progress-bar temp" 
              style={{ 
                width: `${Math.min((telemetry.ect / 120) * 100, 100)}%`,
                backgroundColor: isTempCritical ? '#ef4444' : '#10b981'
              }}
            ></div>
          </div>
        </div>

        {/* CARD 4: LAMBDA & EFICIÊNCIA VOLUMÉTRICA */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-label">LAMBDA / MISTURA (AFR)</span>
            <span className="card-badge">
              {telemetry.lambda < 0.90 ? 'MISTURA RICA' : telemetry.lambda > 1.05 ? 'MISTURA POBRE' : 'ESTEQUIOMÉTRICO'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0.75rem 0' }}>
            <div className="metric-row" style={{ margin: 0 }}>
              <span className="metric-value tnum">
                {telemetry.lambda.toFixed(2)}
              </span>
              <span className="metric-unit">λ</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="temp-sublabel">VE (EFIC. VOL.)</span>
              <span className="tnum" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                {telemetry.ve}%
              </span>
            </div>
          </div>

          <div className="lambda-slider-track">
            <span style={{ color: '#fbbf24' }}>RICO (0.82)</span>
            <div className="lambda-bar-base">
              <div 
                className="lambda-point" 
                style={{ left: `${lambdaPos}%` }}
              ></div>
            </div>
            <span style={{ color: '#38bdf8' }}>POBRE (1.10)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
