type HeaderMenu = {
  label: string
  targetId?: string
  home?: boolean
}

const HEADER_MENUS: HeaderMenu[] = [
  { label: '홈', home: true },
  { label: '업무 메뉴', targetId: 'link-menu' },
  { label: '운영 정보', targetId: 'post-menu' },
]

function moveToSection(menu: HeaderMenu) {
  if (menu.home) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  if (!menu.targetId) return
  document.getElementById(menu.targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Header() {
  return (
    <nav className="site-header">
      <div className="page-container header-inner">
        <div className="header-brand">
          <div className="header-brand-team">
            <span className="header-lg">LG U+</span>
            <span className="header-dot">·</span>
            <span className="header-team clamp-1">NW AX추진팀</span>
          </div>
          <span className="header-brand-divider" />
          <span className="header-square-title clamp-1">NW AX 운영스퀘어</span>
        </div>

        <div className="header-nav">
          {HEADER_MENUS.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={`header-nav-button${index === 0 ? ' is-active' : ''}`}
              onClick={() => moveToSection(item)}
              title={item.label}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
