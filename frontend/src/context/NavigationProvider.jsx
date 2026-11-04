import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { NavigationContext } from './navigation-store.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function NavigationProvider({ children }) {
  const entries = useRef(new Map());
  const [paymentPending, setPaymentPending] = useState(false);
  const [pending, setPending] = useState(null);
  const register = useCallback((id, dirty, label) => {
    if (dirty) {
      entries.current.set(id, label);
    } else {
      entries.current.delete(id);
    }
  }, []);
  const shouldBlock = useCallback(({ currentLocation, nextLocation }) => {
    const block =
      entries.current.size > 0 && currentLocation.pathname !== nextLocation.pathname;
    if (block) {
      setPaymentPending(
        [...entries.current.values()].includes('Cobro pendiente de confirmación'),
      );
    }
    return block;
  }, []);
  const blocker = useBlocker(shouldBlock);
  const requestAction = useCallback((action, localDirty = null) => {
    const needsConfirmation = localDirty ?? entries.current.size > 0;
    if (needsConfirmation) {
      setPaymentPending(
        localDirty === null &&
          [...entries.current.values()].includes('Cobro pendiente de confirmación'),
      );
      setPending(() => action);
    } else {
      action();
    }
  }, []);
  useEffect(() => {
    const unload = (event) => {
      if (entries.current.size) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', unload);
    return () => window.removeEventListener('beforeunload', unload);
  }, []);

  function cancel() {
    setPending(null);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }

  function discard() {
    if (paymentPending) {
      cancel();
      return;
    }
    const action = pending;
    setPending(null);
    if (blocker.state === 'blocked') {
      entries.current.clear();
      blocker.proceed();
    } else {
      action?.();
    }
  }
  return (
    <NavigationContext.Provider value={{ register, requestAction }}>
      {children}
      <ConfirmDialog
        variant={paymentPending ? 'warning' : 'plain'}
        isOpen={!!pending || blocker.state === 'blocked'}
        title={paymentPending ? 'Cobro pendiente de confirmación' : 'Cambios sin guardar'}
        cancelLabel="Seguir editando"
        confirmLabel={paymentPending ? 'Volver a la venta' : 'Salir sin guardar'}
        onCancel={cancel}
        onConfirm={discard}
      >
        {paymentPending
          ? 'Reintenta la misma venta para conocer su resultado antes de salir. Así se evita repetir un cobro.'
          : '¿Salir sin guardar los cambios?'}
      </ConfirmDialog>
    </NavigationContext.Provider>
  );
}
