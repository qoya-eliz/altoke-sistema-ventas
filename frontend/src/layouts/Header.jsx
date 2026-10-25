import { useState, useEffect } from 'react';

export default function Header({ title }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour should be 12
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${strHours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h3>{title}</h3>
        <span>Minimarket ALTOKE S.A.C.</span>
      </div>
      <div className="header-right">
        <div className="live-clock">
          <i className="bi bi-calendar3"></i>
          <span>{formatDate(currentTime)}</span>
        </div>
        <div className="badge-caja">
          <i className="bi bi-display"></i>
          <span>CAJA 01</span>
        </div>
      </div>
    </header>
  );
}
