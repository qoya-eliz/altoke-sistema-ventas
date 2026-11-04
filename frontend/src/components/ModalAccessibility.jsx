import { useEffect } from 'react';

export default function ModalAccessibility() {
  useEffect(() => {
    const known = new Map();
    const selector =
      'button:not(:disabled), input:not(:disabled):not([readonly]), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]';
    const visible = (element) => element.getClientRects().length > 0;

    function dialogs() {
      return [...document.querySelectorAll('.modal.show')]
        .filter(visible)
        .sort(
          (a, b) =>
            (Number(getComputedStyle(a).zIndex) || 1055) -
            (Number(getComputedStyle(b).zIndex) || 1055),
        );
    }

    function sync() {
      for (const dialog of dialogs()) {
        if (known.has(dialog)) {
          continue;
        }
        const previous = document.activeElement;
        known.set(dialog, previous);
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        if (
          !dialog.hasAttribute('aria-label') &&
          !dialog.hasAttribute('aria-labelledby')
        ) {
          dialog.setAttribute(
            'aria-label',
            dialog.querySelector('.modal-title')?.textContent || 'Ventana de diálogo',
          );
        }
        dialog
          .querySelectorAll('.btn-close')
          .forEach((button) => button.setAttribute('aria-label', 'Cerrar ventana'));
        const first =
          dialog.querySelector('[data-initial-focus]') ||
          [...dialog.querySelectorAll(selector)].find(visible);
        first?.focus();
      }
      for (const [dialog, previous] of known) {
        if (!dialog.isConnected) {
          known.delete(dialog);
          if (previous?.isConnected) {
            previous.focus();
          }
        }
      }
      document.body.classList.toggle('altoke-modal-open', known.size > 0);
    }

    function keys(event) {
      const dialog = dialogs().at(-1);
      if (!dialog) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        dialog.querySelector('.btn-cancel, .btn-close')?.click();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const controls = [...dialog.querySelectorAll(selector)].filter(visible);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    sync();
    document.addEventListener('keydown', keys, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', keys, true);
      document.body.classList.remove('altoke-modal-open');
    };
  }, []);
  return null;
}
