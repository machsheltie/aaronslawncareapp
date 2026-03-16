import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Customers from '@/pages/Customers'
import CustomerDetail from '@/pages/CustomerDetail'
import CustomerForm from '@/pages/CustomerForm'
import Jobs from '@/pages/Jobs'
import JobDetail from '@/pages/JobDetail'
import JobForm from '@/pages/JobForm'
import Schedules from '@/pages/Schedules'
import Invoices from '@/pages/Invoices'
import InvoiceForm from '@/pages/InvoiceForm'
import InvoiceDetail from '@/pages/InvoiceDetail'
import Reports from '@/pages/Reports'
import MyDay from '@/pages/MyDay'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<MyDay />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<JobForm />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/:id/edit" element={<JobForm />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
