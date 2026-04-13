import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import LogFood from '@/pages/LogFood'
import BarcodeScan from '@/pages/BarcodeScan'
import CustomFood from '@/pages/CustomFood'
import FoodLibrary from '@/pages/FoodLibrary'
import MealTemplates from '@/pages/MealTemplates'
import Settings from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogFood />} />
            <Route path="/log/scan" element={<BarcodeScan />} />
            <Route path="/log/custom" element={<CustomFood />} />
            <Route path="/foods" element={<FoodLibrary />} />
            <Route path="/templates" element={<MealTemplates />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: '#12122a',
            border: '1px solid #2a2a4a',
            color: '#e8e0f0',
          },
        }}
      />
    </QueryClientProvider>
  )
}
