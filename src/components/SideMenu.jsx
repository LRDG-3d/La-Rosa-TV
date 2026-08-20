export default function SideMenu({ open, onClose }) {
  return (
    <>
      <div
        className={`overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      ></div>
      <nav className={`side-menu ${open ? 'open' : ''}`}>
        <div className="side-menu-title">Menú</div>
        {/* Aquí puedes agregar más opciones a futuro */}
      </nav>
    </>
  )
}
