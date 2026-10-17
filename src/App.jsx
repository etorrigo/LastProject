import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import TelemetryGrid from './components/TelemetryGrid';
import DiagnosticScanner from './components/DiagnosticScanner';

// BANCO DE DTCs AUTOMOTIVOS
const DTC_DATABASE = [
  { code: 'P0102', system: 'Admissão (MAF)', desc: 'Sensor de Fluxo de Massa de Ar - Sinal Baixo', severity: 'warning' },
  { code: 'P0171', system: 'Alimentação', desc: 'Mistura Excessivamente Pobre (Banco 1)', severity: 'warning' },
  { code: 'P0234', system: 'Sobrealimentação', desc: 'Condição de Sobrepressão do Turbo (Overboost)', severity: 'critical' },
  { code: 'P0300', system: 'Ignição', desc: 'Falha de Ignição Aleatória/Múltiplos Cilindros', severity: 'critical' },
  { code: 'P0118', system: 'Arrefecimento', desc: 'Sensor ECT de Temperatura de Água - Tensão Alta', severity: 'warning' },
  { code: 'P0500', system: 'Velocidade', desc: 'Sensor de Velocidade do Veículo (VSS) - Sem Sinal', severity: 'warning' }
];

export default function App() {
  // Estados de Conexão
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected'
  const [voltage, setVoltage] = useState(13.8);
  const [latency, setLatency] = useState(14);

  // Estados de Telemetria
  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    boost: 0.0,
    ect: 0,
    eot: 0,
    lambda: 1.00,
    ve: 0
  });
  const [peakRpm, setPeakRpm] = useState(0);

  // Estados do Scanner
  const [dtcs, setDtcs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([
    { time: '00:00:00.000', message: 'Sistema HMI inicializado. Aguardando link de telemetria OBD2...', color: '' }
  ]);

  // Função auxiliar para logs CAN
  const addLog = (message, color = '') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs((prev) => [...prev.slice(-30), { time: timeStr, message, color }]);
  };

  // Alternar Conexão Bluetooth
  const handleToggleConnection = () => {
    if (connectionStatus === 'connected') {
      setConnectionStatus('disconnected');
      setTelemetry({
        rpm: 0,
        boost: 0.0,
        ect: 0,
        eot: 0,
        lambda: 1.00,
        ve: 0
      });
      addLog('Link Bluetooth encerrado pelo operador.', 'rose');
      return;
    }

    if (connectionStatus === 'connecting') return;

    setConnectionStatus('connecting');
    addLog('Iniciando handshake Bluetooth SPP com adaptador ELM327/ECU...', 'amber');

    setTimeout(() => {
      setConnectionStatus('connected');
      addLog('Handshake CAN OK! Protocolo: ISO 15765-4 CAN 11bit 500k baud.', 'green');
      addLog('Fluxo de telemetria em alta frequência habilitado (10 Hz).', 'cyan');
    }, 1500);
  };

  // Efeito de Simulação em Tempo Real (Intervalo de 1s)
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    const interval = setInterval(() => {
      // 1. Simulação RPM
      const isSpooling = Math.random() > 0.45;
      const rpm = isSpooling 
        ? Math.floor(3400 + Math.random() * 3400) 
        : Math.floor(920 + Math.random() * 550);

      setPeakRpm((prevPeak) => Math.max(prevPeak, rpm));

      // 2. Pressão do Turbo Boost (Bar)
      let boost = -0.65;
      if (rpm > 2400) {
        boost = ((rpm - 2400) / 4200) * 1.55 + (Math.random() * 0.18 - 0.09);
      }
      boost = Math.max(-0.8, Math.min(2.1, boost));

      // 3. Temperaturas
      const ect = Math.floor(91 + Math.random() * 5);
      const eot = Math.floor(98 + Math.random() * 7);

      // 4. Lambda & Eficiência Volumétrica
      let lambda = 0.98 + (Math.random() * 0.06 - 0.03);
      if (rpm > 4500) lambda = 0.84 + Math.random() * 0.04;
      const ve = Math.min(105, Math.floor((rpm / 7000) * 85 + (boost > 0 ? boost * 15 : 0)));

      // Atualiza telemetria
      setTelemetry({
        rpm,
        boost,
        ect,
        eot,
        lambda,
        ve
      });

      // Flutuação de Tensão e Latência
      setVoltage(Number((13.8 + (Math.random() * 0.3 - 0.15)).toFixed(1)));
      setLatency(Math.floor(12 + Math.random() * 6));

    }, 1000);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Executar Varredura (Scan DTCs)
  const handleScan = () => {
    if (connectionStatus !== 'connected') {
      alert('Aviso: Módulo desconectado. Conecte à ECU antes de executar a varredura.');
      return;
    }

    setIsScanning(true);
    addLog('Enviando comando OBD PID Mode 03 (Request Emission-Related DTCs)...', 'cyan');

    setTimeout(() => {
      setIsScanning(false);
      const foundCount = Math.floor(1 + Math.random() * 2);
      const shuffled = [...DTC_DATABASE].sort(() => 0.5 - Math.random());
      const newDTCs = shuffled.slice(0, foundCount);

      setDtcs((prev) => {
        const updated = [...prev];
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];

        newDTCs.forEach((dtc) => {
          if (!updated.some((d) => d.code === dtc.code)) {
            updated.push({ ...dtc, timestamp: time });
            addLog(`FALHA DETECTADA: [${dtc.code}] - ${dtc.desc}`, dtc.severity === 'critical' ? 'rose' : 'amber');
          }
        });
        return updated;
      });
    }, 1200);
  };

  // Limpar Códigos
  const handleClear = () => {
    if (connectionStatus !== 'connected' && dtcs.length === 0) {
      alert('Nenhum código para limpar.');
      return;
    }
    addLog('Enviando PID Mode 04 (Clear Diagnostic Info & Malfunction Lamp)...', 'amber');
    setDtcs([]);
    addLog('Buffer de DTCs da ECU limpo com sucesso. Lâmpada MIL apagada.', 'green');
  };

  // Remover Código Individual
  const handleRemoveCode = (codeToRemove) => {
    setDtcs((prev) => prev.filter((d) => d.code !== codeToRemove));
    addLog(`Código [${codeToRemove}] removido individualmente do buffer local.`, '');
  };

  // Exportar Log CSV
  const handleExportCSV = () => {
    if (dtcs.length === 0) {
      alert('O buffer de diagnósticos está vazio. Execute um Scan primeiro.');
      return;
    }

    let csv = 'Horario,Codigo_DTC,Subsistema,Descricao,Severidade\n';
    dtcs.forEach((d) => {
      csv += `"${d.timestamp}","${d.code}","${d.system}","${d.desc}","${d.severity}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ecu_diagnostic_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog('Arquivo de log de diagnósticos exportado (.CSV).', 'cyan');
  };

  return (
    <div className="app-container">
      {/* Header Fixo */}
      <Header
        connectionStatus={connectionStatus}
        onToggleConnection={handleToggleConnection}
        voltage={voltage}
        latency={connectionStatus === 'connected' ? latency : null}
      />

      {/* Conteúdo Principal */}
      <main className="main-content">
        {/* Grid de Telemetria */}
        <TelemetryGrid telemetry={telemetry} peakRpm={peakRpm} />

        {/* Painel do Scanner */}
        <DiagnosticScanner
          dtcs={dtcs}
          isScanning={isScanning}
          onScan={handleScan}
          onClear={handleClear}
          onRemoveCode={handleRemoveCode}
          onExportCSV={handleExportCSV}
          logs={logs}
        />
      </main>
    </div>
  );
}
