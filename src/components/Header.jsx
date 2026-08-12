import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">🌹 La <span>Rosa</span></Link>
      <nav>
        <Link to="/">Capítulos</Link>
        <a href="#temporadas">Temporadas</a>
      </nav>
    </header>
  )
}
