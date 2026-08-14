import { useState, useEffect, useRef } from 'react';
import { VncScreen } from 'react-vnc';
import './vnc.css';

export default function Vnc() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('6080');
  const [path, setPath] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const [status, setStatus] = useState('idle'); // idle | connecting | live | error
  const [statusText, setStatusText] = useState('inactivo');
  const [msg, setMsg] = useState(null); // { text, type }
  const [connected, setConnected] = useState(false);
  const [tuning, setTuning] = useState(false);

  const [vncUrl, setVncUrl] = useState(null);
  const screenWrapRef = useRef(null);
  const vncRef = useRef(null);

  // Load remembered connection
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('vnc-conn') || '{}');
    if (saved.host) setHost(saved.host);
    if (saved.port) setPort(saved.port);
    if (saved.path) setPath(saved.path);
    if (saved.remember) setRemember(true);
  }, []);

  const handleConnect = () => {
    if (!host.trim()) {
      setMsg({ text: 'Ingresá un host para conectar.', type: 'error' });
      return;
    }
    setMsg(null);

    if (remember) {
      localStorage.setItem('vnc-conn', JSON.stringify({ host, port, path, remember: true }));
    } else {
      localStorage.removeItem('vnc-conn');
    }

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    setStatus('connecting');
    setStatusText('conectando…');
    setVncUrl(`${proto}://${host}:${port || '6080'}/${path}`);
  };

  const onVncConnect = () => {
    setStatus('live');
    setStatusText('en vivo');
    setConnected(true);
    setTuning(true);
    setTimeout(() => setTuning(false), 700);
  };

  const onVncDisconnect = () => {
    setConnected(false);
    setVncUrl(null);
    setStatus('idle');
    setStatusText('inactivo');
  };

  const onVncCredentialsRequired = () => {
    setMsg({ text: 'El servidor requiere contraseña.', type: 'error' });
    vncRef.current?.sendCredentials({ password });
  };

  const handleDisconnect = () => {
    vncRef.current?.disconnect();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      screenWrapRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleCtrlAltDel = () => {
    vncRef.current?.sendCtrlAltDel();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleConnect();
  };

  return (
    <div className="vnc-app">
      <header className="vnc-header">
        <div className="vnc-brand">
          <div className="vnc-brand-mark">R</div>
          <div className="vnc-brand-text">REMOTO <span>/ cliente vnc</span></div>
        </div>
        <div className="vnc-status-pill">
          <div className={`vnc-radar ${status}`} />
          <span>{statusText}</span>
        </div>
      </header>

      <main className="vnc-main">
        {!connected && (
          <div className="vnc-connect-view">
            <div className="vnc-eyebrow">Sesión remota</div>
            <h1>Conectate a tu equipo</h1>
            <p className="vnc-sub">
              Ingresá la dirección de tu servidor VNC. Si usás Tailscale, es el nombre de la
              máquina o su IP de la red tailscale (100.x.x.x).
            </p>

            <div className="vnc-panel">
              <div className="vnc-row2">
                <div className="vnc-field">
                  <label>Host</label>
                  <input
                    type="text"
                    placeholder="100.101.102.103"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    onKeyDown={onKeyDown}
                  />
                </div>
                <div className="vnc-field vnc-narrow">
                  <label>Puerto</label>
                  <input
                    type="number"
                    placeholder="6080"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    onKeyDown={onKeyDown}
                  />
                </div>
              </div>
              <div className="vnc-field">
                <label>Ruta websocket (opcional)</label>
                <input
                  type="text"
                  placeholder="websockify"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
              <div className="vnc-field">
                <label>Contraseña VNC</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>

              <label className="vnc-checkbox-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Recordar host y puerto en este navegador
              </label>

              <button className="vnc-btn" onClick={handleConnect} disabled={status === 'connecting'}>
                {status === 'connecting' ? 'Conectando…' : 'Conectar'}
              </button>

              {msg && <div className={`vnc-msg show ${msg.type}`}>{msg.text}</div>}
            </div>

            <p className="vnc-hint">
              Esta página es solo el visor. Necesita un servidor VNC + <code>websockify</code>{' '}
              corriendo del lado de tu PC (o un túnel como Tailscale) escuchando en el host y
              puerto que ingreses acá.
            </p>
          </div>
        )}

        {connected && (
          <div className="vnc-viewer-view">
            <div className="vnc-viewer-toolbar">
              <div className="vnc-host-info">
                conectado a <b>{host}</b>
              </div>
              <div className="vnc-toolbar-actions">
                <button className="vnc-tbtn" onClick={handleFullscreen}>Pantalla completa</button>
                <button className="vnc-tbtn" onClick={handleCtrlAltDel}>Ctrl+Alt+Supr</button>
                <button className="vnc-tbtn danger" onClick={handleDisconnect}>Desconectar</button>
              </div>
            </div>
            <div ref={screenWrapRef} className={`vnc-screen-wrap ${tuning ? 'tuning' : ''}`}>
              {vncUrl && (
                <VncScreen
                  ref={vncRef}
                  url={vncUrl}
                  scaleViewport
                  background="#000000"
                  style={{ width: '100%', height: '100%' }}
                  rfbOptions={{ credentials: { password } }}
                  onConnect={onVncConnect}
                  onDisconnect={onVncDisconnect}
                  onCredentialsRequired={onVncCredentialsRequired}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="vnc-footer">acceso remoto personal · noVNC</footer>
    </div>
  );
}
