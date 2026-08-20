export default function TopBar({ onMenuClick }) {
  return (
    <div className="topbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Menú">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>
      <div className="topbar-title">La Rosa TV</div>
      <div></div>
    </div>
  )
}
