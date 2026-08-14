import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './shared/hooks/useTheme'
import { Layout } from './shared/components/Layout'
import { Dashboard } from './pages/Dashboard'
import { HealthPage } from './pages/HealthPage'
import { ClientsPage } from './modules/clients/pages/ClientsPage'
import { ProductsPage } from './modules/products/pages/ProductsPage'
import { OrdersPage } from './modules/orders/pages/OrdersPage'
import { NewOrderPage } from './modules/orders/pages/NewOrderPage'
import { OrderDetailPage } from './modules/orders/pages/OrderDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<NewOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  )
}
