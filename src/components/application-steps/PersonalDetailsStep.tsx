import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface PersonalDetailsStepProps {
  data: any
  updateData: (data: any) => void
  errors?: Record<string, string>
}

export function PersonalDetailsStep({ data, updateData, errors = {} }: PersonalDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Select
            value={data.title}
            onValueChange={(value) => updateData({ title: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mr">Mr</SelectItem>
              <SelectItem value="Mrs">Mrs</SelectItem>
              <SelectItem value="Ms">Ms</SelectItem>
              <SelectItem value="Miss">Miss</SelectItem>
              <SelectItem value="Dr">Dr</SelectItem>
              <SelectItem value="Prof">Prof</SelectItem>
              <SelectItem value="Rev">Rev</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="idNumber" className={errors.idNumber ? 'text-red-500' : ''}>South African ID Number</Label>
        <Input
          id="idNumber"
          type="text"
          placeholder="800105009087"
          value={data.idNumber}
          onChange={(e) => updateData({ idNumber: e.target.value })}
          maxLength={13}
          required
          className={errors.idNumber ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500">Your 13-digit SA ID number</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className={errors.fullName ? 'text-red-500' : ''}>Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          required
          className={errors.fullName ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maritalStatus">Marital Status</Label>
        <Select
          value={data.maritalStatus}
          onValueChange={(value) => updateData({ maritalStatus: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Marital Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Single">Single</SelectItem>
            <SelectItem value="Married (Community of Property)">Married (Community of Property)</SelectItem>
            <SelectItem value="Married (Ante Nuptial Contract)">Married (Ante Nuptial Contract)</SelectItem>
            <SelectItem value="Divorced">Divorced</SelectItem>
            <SelectItem value="Widowed">Widowed</SelectItem>
            <SelectItem value="Separated">Separated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className={errors.phone ? 'text-red-500' : ''}>Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0821234567"
          value={data.phone}
          onChange={(e) => updateData({ phone: e.target.value })}
          required
          className={errors.phone ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className={errors.email ? 'text-red-500' : ''}>Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          required
          className={errors.email ? 'border-red-500' : ''}
        />
      </div>

      <div className="border-t pt-2 mt-4">
        <h3 className="text-md font-semibold mb-3">Next of Kin Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nokName" className={errors.nokName ? 'text-red-500' : ''}>Name</Label>
              <Input
                id="nokName"
                value={data.nextOfKin?.name || ''}
                onChange={(e) => updateData({ nextOfKin: { ...data.nextOfKin, name: e.target.value } })}
                required
                className={errors.nokName ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nokSurname" className={errors.nokSurname ? 'text-red-500' : ''}>Surname</Label>
              <Input
                id="nokSurname"
                value={data.nextOfKin?.surname || ''}
                onChange={(e) => updateData({ nextOfKin: { ...data.nextOfKin, surname: e.target.value } })}
                required
                className={errors.nokSurname ? 'border-red-500' : ''}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nokRelation" className={errors.nokRelation ? 'text-red-500' : ''}>Relation</Label>
            <Input
              id="nokRelation"
              placeholder="e.g. Spouse, Parent, Sibling"
              value={data.nextOfKin?.relation || ''}
              onChange={(e) => updateData({ nextOfKin: { ...data.nextOfKin, relation: e.target.value } })}
              required
              className={errors.nokRelation ? 'border-red-500' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nokPhone" className={errors.nokPhone ? 'text-red-500' : ''}>Phone Number</Label>
              <Input
                id="nokPhone"
                type="tel"
                value={data.nextOfKin?.phoneNumber || ''}
                onChange={(e) => updateData({ nextOfKin: { ...data.nextOfKin, phoneNumber: e.target.value } })}
                required
                className={errors.nokPhone ? 'border-red-500' : ''}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="nokPhoneType">Type</Label>
              <Select
                value={data.nextOfKin?.phoneType || 'Mobile'}
                onValueChange={(value) => updateData({ nextOfKin: { ...data.nextOfKin, phoneType: value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nokEmail" className={errors.nokEmail ? 'text-red-500' : ''}>Email</Label>
            <Input
              id="nokEmail"
              type="email"
              value={data.nextOfKin?.email || ''}
              onChange={(e) => updateData({ nextOfKin: { ...data.nextOfKin, email: e.target.value } })}
              required
              className={errors.nokEmail ? 'border-red-500' : ''}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-6 space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptPOPIA"
            checked={data.acceptPOPIA}
            onCheckedChange={(checked) => updateData({ acceptPOPIA: checked })}
            className={errors.acceptPOPIA ? 'border-red-500' : ''}
          />
          <div className="space-y-1">
            <label htmlFor="acceptPOPIA" className={`text-sm cursor-pointer ${errors.acceptPOPIA ? 'text-red-500' : ''}`}>
              I consent to the collection and processing of my personal information in accordance with POPIA
            </label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptExperian"
            checked={data.acceptExperian}
            onCheckedChange={(checked) => updateData({ acceptExperian: checked })}
            className={errors.acceptExperian ? 'border-red-500' : ''}
          />
          <div className="space-y-1">
            <label htmlFor="acceptExperian" className={`text-sm cursor-pointer ${errors.acceptExperian ? 'text-red-500' : ''}`}>
              I consent to an Experian credit check and affordability assessment
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}