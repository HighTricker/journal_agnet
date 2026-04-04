import { Link, useLocation } from 'react-router-dom'
import MaterialIcon from '../ui/MaterialIcon'

const NAV_ITEMS = [
    { path: '/diary', label: '日记', icon: 'home_storage' },
    { path: '/weekly', label: '周记', icon: 'edit_note' },
    { path: '/monthly', label: '月记', icon: 'equalizer' },
    { path: '/ai', label: 'AI导师', icon: 'person' },
]

function BottomNavBar() {
    const location = useLocation()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 flex justify-around items-center px-6 bg-white/80 backdrop-blur-xl z-50 shadow-[0_-4px_20px_0_rgba(25,28,30,0.05)]">
            {NAV_ITEMS.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center transition-transform ${
                            isActive
                                ? 'text-primary font-semibold'
                                : 'text-secondary hover:scale-110'
                        }`}
                    >
                        <MaterialIcon
                            name={item.icon}
                            filled={isActive}
                            className="text-2xl"
                        />
                        <span className="text-[11px] font-medium">{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}

export default BottomNavBar
