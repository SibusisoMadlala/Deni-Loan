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
}

export function WorkIncomeStep({ data, updateData }: WorkIncomeStepProps) {
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
        <Label htmlFor="employerAddress">Employer Address</Label>
        <Input
          id="employerAddress"
          type="text"
          placeholder="123 Business Rd, Sandton"
          value={data.employerAddress || ''}
          onChange={(e) => updateData({ employerAddress: e.target.value })}
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
        <Label>Next Pay Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.nextPayDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.nextPayDate ? format(new Date(data.nextPayDate), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.nextPayDate ? new Date(data.nextPayDate) : undefined}
              onSelect={(date) => updateData({ nextPayDate: date ? date.toISOString() : undefined })}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date > getCycleEndDate()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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