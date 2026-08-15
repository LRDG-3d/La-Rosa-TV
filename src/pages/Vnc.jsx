import { useState, useRef, useEffect } from 'react';
import { VncScreen } from 'react-vnc';
import './vnc.css';

export default function Vnc() {
  // QEMU's built-in `-vnc :N,websocket=on` serves the websocket on 5700+N by default
  const QEMU_WS_BASE_PORT = 5700;

  const [host, setHost] = useState('');
  const [port, setPort] = useState('6080');
  const [path, setPath] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [portTouched, setPortTouched] = useState(false);
  const [qemuDisplay, setQemuDisplay] = useState(null); // detected display number, or null

  // modalPhase: null (closed) | 'loading' | 'error' | 'connected'
  const [modalPhase, setModalPhase] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [vncUrl, setVncUrl] = useState(null);

  const modalScreenRef = useRef(null);
  const vncRef = useRef(null);

  // Load remembered connection
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('vnc-conn') || '{}');
    if (saved.host) setHost(saved.host);
    if (saved.port) setPort(saved.port);
    if (saved.path) setPath(saved.path);
    if (saved.remember) setRemember(true);
  }, []);

  const statusFor = (phase) => {
    if (phase === 'loading') return { cls: 'connecting', text: 'conectando…' };
    if (phase === 'connected') return { cls: 'live', text: 'en vivo' };
    if (phase === 'error') return { cls: 'error', text: 'error' };
    return { cls: 'idle', text: 'inactivo' };
  };
  const status = statusFor(modalPhase);

  const handleConnect = () => {
    if (!host.trim()) {
      setModalPhase('error');
      setErrorText('Ingresá un host para conectar.');
      return;
    }

    if (remember) {
      localStorage.setItem('vnc-conn', JSON.stringify({ host, port, path, remember: true }));
    } else {
      localStorage.removeItem('vnc-conn');
    }

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    setErrorText('');
    setModalPhase('loading');
    setVncUrl(`${proto}://${resolvedHost}:${port || '6080'}/${path}`);
  };

  const onVncConnect = () => {
    setModalPhase('connected');
  };

  const onVncDisconnect = () => {
    setModalPhase((prev) => {
      if (prev === 'connected') {
        // Was live and dropped — close the modal back to the form
        setVncUrl(null);
        return null;
      }
      // Never made it to "connected" — surface it as an error
      setErrorText('No se pudo conectar. Revisá el host, el puerto y que el servidor esté activo.');
      return 'error';
    });
  };

  const onVncCredentialsRequired = () => {
    if (password) {
      vncRef.current?.sendCredentials({ password });
    } else {
      setErrorText('El servidor requiere contraseña.');
      setModalPhase('error');
    }
  };

  const closeModal = () => {
    vncRef.current?.disconnect();
    setVncUrl(null);
    setModalPhase(null);
  };

  const retryConnect = () => {
    setModalPhase(null);
    setVncUrl(null);
    setTimeout(handleConnect, 0);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalScreenRef.current?.requestFullscreen().catch(() => {});
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

  // Detects QEMU-style "host:N" addresses (e.g. localhost:2) and auto-fills
  // the websocket port using QEMU's default offset (5700 + display number).
  const handleHostChange = (value) => {
    setHost(value);
    const match = value.trim().match(/^(.+):(\d{1,2})$/);
    if (match) {
      const display = parseInt(match[2], 10);
      setQemuDisplay(display);
      if (!portTouched) {
        setPort(String(QEMU_WS_BASE_PORT + display));
      }
    } else {
      setQemuDisplay(null);
    }
  };

  const handlePortChange = (value) => {
    setPort(value);
    setPortTouched(true);
  };

  // Strip a trailing ":N" QEMU display suffix before using the host in the actual URL
  const resolvedHost = qemuDisplay !== null ? host.trim().replace(/:(\d{1,2})$/, '') : host.trim();

  return (
    <div className="vnc-app">
      <header className="vnc-header">
        <div className="vnc-brand">
          <div className="vnc-brand-mark">R</div>
          <div className="vnc-brand-text">REMOTO <span>/ cliente vnc</span></div>
        </div>
        <div className="vnc-status-pill">
          <div className={`vnc-radar ${status.cls}`} />
          <span>{status.text}</span>
        </div>
      </header>

      <main className="vnc-main">
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
                  placeholder="100.101.102.103 o localhost:2 (QEMU)"
                  value={host}
                  onChange={(e) => handleHostChange(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                {qemuDisplay !== null && (
                  <p className="vnc-field-hint">
                    Display QEMU {qemuDisplay} detectado → puerto websocket {QEMU_WS_BASE_PORT + qemuDisplay}
                    {' '}(requiere <code>-vnc :{qemuDisplay},websocket=on</code>)
                  </p>
                )}
              </div>
              <div className="vnc-field vnc-narrow">
                <label>Puerto</label>
                <input
                  type="number"
                  placeholder="6080"
                  value={port}
                  onChange={(e) => handlePortChange(e.target.value)}
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
              <label>Contraseña VNC <span className="vnc-optional">(opcional)</span></label>
              <input
                type="password"
                placeholder="Dejar vacío si el servidor no pide clave"
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

            <button className="vnc-btn" onClick={handleConnect}>
              Conectar
            </button>
          </div>

          <p className="vnc-hint">
            Esta página es solo el visor. Necesita un servidor VNC + <code>websockify</code>{' '}
            corriendo del lado de tu PC (o un túnel como Tailscale) escuchando en el host y
            puerto que ingreses acá. Para QEMU, también podés escribir el host como{' '}
            <code>localhost:2</code> (número de display) si arrancaste la VM con{' '}
            <code>-vnc :2,websocket=on</code> — no hace falta <code>websockify</code> en ese caso.
          </p>
        </div>
      </main>

      <footer className="vnc-footer">acceso remoto personal · noVNC</footer>

      {modalPhase && (
        <div className="vnc-modal-overlay" onClick={(e) => e.target === e.currentTarget && modalPhase !== 'connected' && closeModal()}>
          <div className={`vnc-modal ${modalPhase === 'connected' ? 'vnc-modal-large' : ''}`}>
            <div className="vnc-modal-header">
              <div className="vnc-modal-title">
                <div className={`vnc-radar ${status.cls}`} />
                <span>{modalPhase === 'connected' ? host : 'Conexión remota'}</span>
              </div>
              <button className="vnc-modal-close" onClick={closeModal} aria-label="Cerrar">✕</button>
            </div>

            <div className="vnc-modal-body">
              {modalPhase === 'loading' && (
                <div className="vnc-modal-state">
                  <div className="vnc-spinner" />
                  <p>Conectando a {host}…</p>
                </div>
              )}

              {modalPhase === 'error' && (
                <div className="vnc-modal-state">
                  <div className="vnc-state-icon error">✕</div>
                  <p className="vnc-state-text error">{errorText}</p>
                  <div className="vnc-modal-actions">
                    <button className="vnc-tbtn" onClick={retryConnect}>Reintentar</button>
                    <button className="vnc-tbtn danger" onClick={closeModal}>Cerrar</button>
                  </div>
                </div>
              )}

              {modalPhase === 'connected' && (
                <div className="vnc-modal-toolbar">
                  <button className="vnc-tbtn" onClick={handleFullscreen}>Pantalla completa</button>
                  <button className="vnc-tbtn" onClick={handleCtrlAltDel}>Ctrl+Alt+Supr</button>
                  <button className="vnc-tbtn danger" onClick={closeModal}>Desconectar</button>
                </div>
              )}

              {/* Mounted as soon as we start connecting, so RFB events actually fire.
                  Only visible once the connection succeeds. */}
              {vncUrl && (
                <div
                  ref={modalScreenRef}
                  className="vnc-modal-screen"
                  style={{ display: modalPhase === 'connected' ? 'flex' : 'none' }}
                >
                  <VncScreen
                    ref={vncRef}
                    url={vncUrl}
                    scaleViewport
                    background="#000000"
                    style={{ width: '100%', height: '100%' }}
                    rfbOptions={password ? { credentials: { password } } : {}}
                    onConnect={onVncConnect}
                    onDisconnect={onVncDisconnect}
                    onCredentialsRequired={onVncCredentialsRequired}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
