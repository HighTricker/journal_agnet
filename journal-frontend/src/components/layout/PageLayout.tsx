import TopAppBar from './TopAppBar'
import BottomNavBar from './BottomNavBar'

interface PageLayoutProps {
    children: React.ReactNode
}

function PageLayout({ children }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
        <TopAppBar />
        <main className="pt-16 pb-20 px-6 max-w-7xl mx-auto">
            {children}
        </main>
        <BottomNavBar />
        </div>
    )
}

export default PageLayout