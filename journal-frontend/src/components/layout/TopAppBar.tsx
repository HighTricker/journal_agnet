import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
    { path: '/diary', label: '日记' },
    { path: '/weekly', label: '周记' },
    { path: '/monthly', label: '月记' },
    { path: '/ai', label: 'AI导师' },
]

function TopAppBar() {
    const location = useLocation()

    return (
        <header className="fixed top-0 w-full z-50 bg-surface">
        <div className="flex justify-between items-center px-8 h-15 max-w-7xl mx-auto">
            <nav className="flex items-center gap-[75px] mx-auto">
            {NAV_ITEMS.map((item) => (
                <Link
                key={item.path}
                to={item.path}
                className={
                    location.pathname.startsWith(item.path)
                    ? 'text-[21px] text-primary font-bold border-b-2 border-primary pb-1'
                    : 'text-[21px] text-on-surface opacity-70 hover:opacity-100 hover:text-primary transition-all'
                }
                >
                {item.label}
                </Link>
            ))}
            </nav>
        </div>
        </header>
    )
}

export default TopAppBar