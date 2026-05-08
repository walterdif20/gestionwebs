import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>CRM Leads</h2>
        <nav>
          <Link className={location.pathname.includes('dashboard') ? 'active' : ''} to="/dashboard">Tablero</Link>
          <Link className={location.pathname.includes('/leads') ? 'active' : ''} to="/leads">Leads</Link>
          <Link to="/leads/new">Crear lead</Link>
        </nav>
      </aside>
      <main>
        <header className="topbar"><h1>Pipeline de clientes Web & IA</h1></header>
        {children}
      </main>
    </div>
  );
}
