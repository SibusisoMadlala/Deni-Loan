import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface BankingDetailsStepProps {
  data: any
  updateData: (data: any) => void
}

const SA_BANKS = [
  'ABSA',
  'Capitec Bank',
  'First National Bank (FNB)',
  'Nedbank',
  'Standard Bank',
  'African Bank',
  'Investec',
  'Discovery Bank',
  'TymeBank',
  'Other'
]

export function BankingDetailsStep({ data, updateData }: BankingDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-900">
          This is where your loan will be paid out and where debit orders will be collected from.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Select
          value={data.bankName}
          onValueChange={(value) => updateData({ bankName: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your bank" />
          </SelectTrigger>
          <SelectContent>
            {SA_BANKS.map((bank) => (
              <SelectItem key={bank} value={bank}>
                {bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountType">Account Type</Label>
        <Select
          value={data.accountType}
          onValueChange={(value) => updateData({ accountType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cheque">Cheque/Current Account</SelectItem>
            <SelectItem value="savings">Savings Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branchCode">Branch Code</Label>
        <Input
          id="branchCode"
          type="text"
          placeholder="250655"
          value={data.branchCode}
          onChange={(e) => updateData({ branchCode: e.target.value })}
          maxLength={6}
          required
        />
        <p className="text-xs text-gray-500">
          6-digit branch code (also called Universal Branch Code)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          type="text"
          placeholder="1234567890"
          value={data.accountNumber}
          onChange={(e) => updateData({ accountNumber: e.target.value })}
          required
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-900">
          <strong>Important:</strong> Please ensure your banking details are correct. Incorrect details
          may delay your payout or result in failed debit order collections.
        </p>
      </div>
    </div>
  )
}