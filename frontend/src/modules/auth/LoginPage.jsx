import { ValidatedInput, ValidatedForm } from '../../components/ValidatedFields.jsx';
import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

export default function Login() {
  const { login } = useAuth();
  const loginLock = useRef(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginLock.current) {
      return;
    }
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Por favor complete todos los campos.');
      return;
    }

    loginLock.current = true;
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setErrorMsg(
        err.message || 'Credenciales incorrectas. Verifique su usuario y contraseña.',
      );
    } finally {
      loginLock.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundColor: '#45131a',
        backgroundImage: 'radial-gradient(circle at center, #5a1924 0%, #300a10 100%)',
        padding: '20px',
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          maxWidth: '840px',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="row g-0">
          {/* Columna Izquierda: Identidad y Marca */}
          <div
            className="col-md-5 d-flex flex-column align-items-center justify-content-center p-4 text-center text-white"
            style={{
              backgroundColor: '#3b0d14',
              borderRight: '1px solid rgba(220, 163, 73, 0.2)',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center mb-3 rounded-circle shadow"
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'rgba(220, 163, 73, 0.15)',
                border: '2px solid #DCA349',
              }}
            >
              <i
                className="bi bi-basket2-fill"
                style={{ fontSize: '2.5rem', color: '#DCA349' }}
              ></i>
            </div>

            <h3 className="fw-bold m-0" style={{ letterSpacing: '1px' }}>
              ALTOKE
            </h3>
            <div
              className="fw-semibold text-warning"
              style={{ fontSize: '0.85rem', letterSpacing: '1.5px' }}
            >
              MINIMARKET S.A.C.
            </div>

            <hr
              style={{
                width: '60px',
                borderColor: '#DCA349',
                borderWidth: '2px',
                opacity: 1,
                margin: '14px 0',
              }}
            />

            <p
              className="small mb-4 text-light"
              style={{ fontSize: '0.78rem', maxWidth: '200px' }}
            >
              SISTEMA DE PUNTO DE VENTA Y GESTIÓN DE CAJA
            </p>

            <span
              className="badge rounded-pill px-3 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.7rem' }}
            >
              v1.1.0 — 2026
            </span>
          </div>

          {/* Columna Derecha: Formulario de Login */}
          <div className="col-md-7 p-4 p-md-5">
            <div className="mb-4 text-center text-md-start">
              <h4 className="fw-bold" style={{ color: '#45131a' }}>
                Iniciar Sesión
              </h4>
              <p className="text-muted small">
                Ingresa tus datos para acceder al sistema
              </p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                <div>{errorMsg}</div>
              </div>
            )}

            <ValidatedForm busy={loading} onSubmit={handleSubmit}>
              {/* Campo Usuario */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Usuario</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-person text-muted"></i>
                  </span>
                  <ValidatedInput
                    name="nom_usuario"
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">
                  Contraseña
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-muted"></i>
                  </span>
                  <ValidatedInput
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control bg-light border-start-0 border-end-0"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0 text-muted"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Botón de Ingreso */}
              <button
                type="submit"
                className="btn w-100 py-2 fw-semibold text-white d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ backgroundColor: '#601824', borderColor: '#45131a' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></span>
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>INGRESAR</span>
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>
            </ValidatedForm>

            <div className="text-center mt-4 pt-2">
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                ¿Problemas para ingresar?{' '}
                <span className="text-danger fw-semibold">
                  Contacta con el Administrador
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
