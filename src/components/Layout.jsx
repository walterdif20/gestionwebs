import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Lead CRM</h2>
        <nav>
          <Link className={location.pathname.includes('dashboard') ? 'active' : ''} to="/dashboard">Dashboard</Link>
          <Link className={location.pathname.includes('/leads') ? 'active' : ''} to="/leads">Leads</Link>
          <Link to="/leads/new">Create Lead</Link>
        </nav>
      </aside>
      <main>
        <header className="topbar"><h1>Web & AI Client Pipeline</h1></header>
        {children}
      </main>
    </div>
  );
}
