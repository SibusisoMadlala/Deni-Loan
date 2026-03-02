import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../ui/utils"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface WorkIncomeStepProps {
  data: any
  updateData: (data: any) => void
  errors?: Record<string, string>
}

export function WorkIncomeStep({ data, updateData, errors = {} }: WorkIncomeStepProps) {
  const expenseCategories = [
    "Rent / Mortgage",
    "Transport / Fuel",
    "Food / Groceries",
    "Utilities (Water, Electricity)",
    "Phone / Data",
    "Loan Repayments",
    "Childcare / School Fees"
  ];

  const handleExpenseChange = (category: string, amount: number, description?: string) => {
    const currentExpenses = data.monthlyExpenses || [];
    const existingIndex = currentExpenses.findIndex((e: any) => e.category === category);
    
    let newExpenses = [...currentExpenses];
    if (existingIndex >= 0) {
       newExpenses[existingIndex] = { ...newExpenses[existingIndex], amount, description };
    } else {
      newExpenses.push({ category, amount, description });
    }
    
    updateData({ monthlyExpenses: newExpenses });
  };

  const getExpenseAmount = (category: string) => {
    return data.monthlyExpenses?.find((e: any) => e.category === category)?.amount || '';
  };

  const getOtherDescription = () => {
    return data.monthlyExpenses?.find((e: any) => e.category === 'Other')?.description || '';
  };

  const totalExpenses = (data.monthlyExpenses || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

  const getCycleEndDate = () => {
    const today = new Date()
    const cycle = data.paydayCycle
    const endDate = new Date(today)

    if (cycle === 'weekly') {
      endDate.setDate(today.getDate() + 7)
    } else if (cycle === 'bi-weekly') {
      endDate.setDate(today.getDate() + 14)
    } else {
      // Monthly default
      endDate.setMonth(today.getMonth() + 1)
    }
    return endDate
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employerName" className={errors.employerName ? 'text-red-500' : ''}>Employer Name</Label>
        <Input
          id="employerName"
          type="text"
          placeholder="ABC Company (Pty) Ltd"
          value={data.employerName}
          onChange={(e) => updateData({ employerName: e.target.value })}
          required
          className={errors.employerName ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employerAddress" className={errors.employerAddress ? 'text-red-500' : ''}>Employer Address</Label>
        <Input
          id="employerAddress"
          type="text"
          placeholder="123 Business Rd, Sandton"
          value={data.employerAddress || ''}
          onChange={(e) => updateData({ employerAddress: e.target.value })}
          required
          className={errors.employerAddress ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employerPhone" className={errors.employerPhone ? 'text-red-500' : ''}>Employer Phone</Label>
        <Input
          id="employerPhone"
          type="tel"
          placeholder="011 123 4567"
          value={data.employerPhone || ''}
          onChange={(e) => updateData({ employerPhone: e.target.value })}
          required
          className={errors.employerPhone ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paydayCycle" className={errors.paydayCycle ? 'text-red-500' : ''}>Payday Cycle</Label>
        <Select
          value={data.paydayCycle}
          onValueChange={(value) => updateData({ paydayCycle: value })}
        >
          <SelectTrigger className={errors.paydayCycle ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select payday cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="bi-weekly">Bi-Weekly (Fortnightly)</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className={errors.nextPayDate ? 'text-red-500' : ''}>Next Pay Date</Label>
        {/* Use native date picker for better compatibility across all devices */}
        <div>
          <Input 
            type="date"
            value={data.nextPayDate ? new Date(data.nextPayDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {
               if (e.target.value) {
                 const parts = e.target.value.split('-');
                 const localDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
                 updateData({ nextPayDate: localDate.toISOString() });
               } else {
                 updateData({ nextPayDate: undefined });
               }
            }}
            min={new Date().toISOString().split('T')[0]}
            max={getCycleEndDate().toISOString().split('T')[0]}
            className={errors.nextPayDate ? 'border-red-500 w-full' : 'w-full'}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="netSalary" className={errors.netSalary ? 'text-red-500' : ''}>Net Salary (After Deductions)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">R</span>
          <Input
            id="netSalary"
            type="number"
            placeholder="5000"
            className={`pl-8 ${errors.netSalary ? 'border-red-500' : ''}`}
            value={data.netSalary || ''}
            onChange={(e) => updateData({ netSalary: parseFloat(e.target.value) || 0 })}
            min="0"
            step="100"
            required
          />
        </div>
        <p className={`text-xs ${errors.netSalary ? 'text-red-500' : 'text-gray-500'}`}>
          Your take-home pay after all deductions (tax, UIF, pension, etc.)
        </p>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="font-medium text-gray-900">Monthly Expenses</h3>
        <p className="text-xs text-gray-500 -mt-2 mb-4">
          Please estimate your monthly expenses to help us check affordability.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenseCategories.map((category) => (
            <div key={category} className="space-y-2">
              <Label htmlFor={`expense-${category}`}>{category}</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                <Input
                  id={`expense-${category}`}
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={getExpenseAmount(category)}
                  onChange={(e) => handleExpenseChange(category, parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
          ))}
          
          {/* Other Expenses */}
          <div className="space-y-2 md:col-span-2 border-t pt-2 mt-2">
            <Label htmlFor="expense-other-amount">Other Expenses</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                <Input
                  id="expense-other-amount"
                  type="number"
                  placeholder="Amount"
                  className="pl-8"
                  value={getExpenseAmount('Other')}
                  onChange={(e) => handleExpenseChange('Other', parseFloat(e.target.value) || 0, getOtherDescription())}
                  min="0"
                />
              </div>
              <Input
                placeholder="Description (e.g. Medical Aid)"
                value={getOtherDescription()}
                onChange={(e) => handleExpenseChange('Other', parseFloat(getExpenseAmount('Other') || '0'), e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
          <span className="font-medium text-sm">Total Monthly Expenses:</span>
          <span className="font-bold text-lg">R{totalExpenses.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requestedAmount">Requested Loan Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">R</span>
          <Input
            id="requestedAmount"
            type="number"
            placeholder="2000"
            className="pl-8"
            value={data.requestedAmount || ''}
            onChange={(e) => updateData({ requestedAmount: parseFloat(e.target.value) || 0 })}
            min="500"
            max="4000"
            step="100"
            required
          />
        </div>
        <p className="text-xs text-gray-500">
          Amount between R500 - R4000
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Your final approved amount will be determined by our affordability assessment,
          which considers your income, expenses, and credit history.
        </p>
      </div>
    </div>
  )
}