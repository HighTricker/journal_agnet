import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast'
import { PageActionsProvider } from './hooks/usePageActions'
import Diary from './pages/Diary'
import Weekly from './pages/Weekly'
import Monthly from './pages/Monthly'
import AISage from './pages/AISage'

function App() {
    return (
        <ToastProvider>
            <PageActionsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Navigate to="/diary" />} />
                        <Route path="/diary" element={<Diary />} />
                        <Route path="/weekly" element={<Weekly />} />
                        <Route path="/monthly" element={<Monthly />} />
                        <Route path="/ai" element={<AISage />} />
                    </Routes>
                </BrowserRouter>
            </PageActionsProvider>
        </ToastProvider>
    )
}

export default App
