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
import Quotes from '@/pages/Quotes'
import Documents from '@/pages/Documents'
import Equipment from '@/pages/Equipment'
import EquipmentDetail from '@/pages/EquipmentDetail'
import EquipmentForm from '@/pages/EquipmentForm'
import Expenses from '@/pages/Expenses'
import ExpenseForm from '@/pages/ExpenseForm'
import SeasonalReminders from '@/pages/SeasonalReminders'
import SeasonalReminderForm from '@/pages/SeasonalReminderForm'

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
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/invoices" element={<Invoices />} />
            <Route path="/documents/invoices/new" element={<InvoiceForm />} />
            <Route path="/documents/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/documents/quotes" element={<Quotes />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/equipment/new" element={<EquipmentForm />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/equipment/:id/edit" element={<EquipmentForm />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/new" element={<ExpenseForm />} />
            <Route path="/expenses/:id/edit" element={<ExpenseForm />} />
            <Route path="/seasonal-reminders" element={<SeasonalReminders />} />
            <Route path="/seasonal-reminders/new" element={<SeasonalReminderForm />} />
            <Route path="/seasonal-reminders/:id/edit" element={<SeasonalReminderForm />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
