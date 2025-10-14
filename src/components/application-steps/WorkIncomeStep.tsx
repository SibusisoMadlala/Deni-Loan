import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface WorkIncomeStepProps {
  data: any
  updateData: (data: any) => void
}

export function WorkIncomeStep({ data, updateData }: WorkIncomeStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employerName">Employer Name</Label>
        <Input
          id="employerName"
          type="text"
          placeholder="ABC Company (Pty) Ltd"
          value={data.employerName}
          onChange={(e) => updateData({ employerName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paydayCycle">Payday Cycle</Label>
        <Select
          value={data.paydayCycle}
          onValueChange={(value) => updateData({ paydayCycle: value })}
        >
          <SelectTrigger>
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
        <Label htmlFor="netSalary">Net Salary (After Deductions)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">R</span>
          <Input
            id="netSalary"
            type="number"
            placeholder="5000"
            className="pl-8"
            value={data.netSalary || ''}
            onChange={(e) => updateData({ netSalary: parseFloat(e.target.value) || 0 })}
            min="0"
            step="100"
            required
          />
        </div>
        <p className="text-xs text-gray-500">
          Your take-home pay after all deductions (tax, UIF, pension, etc.)
        </p>
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