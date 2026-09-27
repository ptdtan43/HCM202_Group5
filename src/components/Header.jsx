import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'T\u1ed5ng quan', end: true },
  { to: '/ly-thuyet', label: 'L\u00fd thuy\u1ebft' },
  { to: '/video', label: 'Video' },
  { to: '/game', label: 'Game' },
]

function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-white/70 bg-white/40 backdrop-blur-xl">
      <div className="animate-fade-up flex items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-700">HCM202</p>
          <p className="m-0 hidden text-base font-semibold text-slate-700 sm:block sm:text-lg">
            {'Tư tưởng Hồ Chí Minh về đại đoàn kết toàn dân tộc'}
          </p>
        </div>

        <nav aria-label="Main navigation" className="flex items-center gap-2 overflow-x-auto py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-base ${
                  isActive
                    ? 'animate-gradient-shift bg-gradient-to-r from-cyan-700 via-sky-700 to-cyan-700 text-white shadow-lg shadow-cyan-700/30'
                    : 'bg-white/70 text-cyan-800 ring-1 ring-cyan-700/15 hover:-translate-y-0.5 hover:bg-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
