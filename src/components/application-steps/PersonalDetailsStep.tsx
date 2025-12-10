import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

interface PersonalDetailsStepProps {
  data: any
  updateData: (data: any) => void
}

export function PersonalDetailsStep({ data, updateData }: PersonalDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="idNumber">South African ID Number</Label>
        <Input
          id="idNumber"
          type="text"
          placeholder="800105009087"
          value={data.idNumber}
          onChange={(e) => updateData({ idNumber: e.target.value })}
          maxLength={13}
          required
        />
        <p className="text-xs text-gray-500">Your 13-digit SA ID number</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0821234567"
          value={data.phone}
          onChange={(e) => updateData({ phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          required
        />
      </div>

      <div className="border-t pt-4 mt-6 space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptPOPIA"
            checked={data.acceptPOPIA}
            onCheckedChange={(checked) => updateData({ acceptPOPIA: checked })}
          />
          <div className="space-y-1">
            <label htmlFor="acceptPOPIA" className="text-sm cursor-pointer">
              I consent to the collection and processing of my personal information in accordance with POPIA
            </label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptExperian"
            checked={data.acceptExperian}
            onCheckedChange={(checked) => updateData({ acceptExperian: checked })}
          />
          <div className="space-y-1">
            <label htmlFor="acceptExperian" className="text-sm cursor-pointer">
              I consent to an Experian credit check and affordability assessment
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}