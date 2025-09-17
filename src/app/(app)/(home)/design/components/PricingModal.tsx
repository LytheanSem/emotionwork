import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, DollarSign, CheckCircle } from 'lucide-react'
import { Equipment } from '../types'
import { calculateTotalCost } from '../config/equipmentPricing'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: Equipment[]
  designName: string
}

export default function PricingModal({ isOpen, onClose, equipment, designName }: PricingModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  if (!isOpen) return null

  const pricing = calculateTotalCost(equipment.map(item => ({ type: item.type })), selectedDuration)
  
  // Group by category
  const categories = pricing.breakdown.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof pricing.breakdown>)

  const durationLabels = {
    daily: 'Daily',
    weekly: 'Weekly', 
    monthly: 'Monthly'
  }

  const durationDescriptions = {
    daily: 'Perfect for single-day events',
    weekly: 'Great for multi-day events',
    monthly: 'Ideal for long-term projects'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500 p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Equipment Quote
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">{designName || 'Untitled Design'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="p-3 overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* Duration Selection */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Rental Duration</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((duration) => {
                const durationPricing = calculateTotalCost(equipment.map(item => ({ type: item.type })), duration)
                return (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedDuration === duration
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-600 mb-1 uppercase">
                        {durationLabels[duration]}
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {durationPricing.currency} {durationPricing.total.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        {durationDescriptions[duration]}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Equipment Breakdown */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Equipment Breakdown</h3>
            
            <div className="space-y-3">
              {Object.entries(categories).map(([category, items]) => (
                <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 text-xs flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      {category} ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </h4>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <div key={index} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-xs truncate">{item.name}</div>
                            <div className="text-xs text-gray-500">
                              {item.quantity} × {pricing.currency} {item.unitPrice.toFixed(0)}/{selectedDuration === 'daily' ? 'day' : selectedDuration === 'weekly' ? 'week' : 'month'}
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-bold text-gray-900">
                              {pricing.currency} {item.totalPrice.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 mb-4 text-white">
            <div className="text-center">
              <div className="text-xs font-medium text-blue-100 mb-1">Total Cost ({durationLabels[selectedDuration]})</div>
              <div className="text-2xl font-bold mb-1">
                {pricing.currency} {pricing.total.toFixed(0)}
              </div>
              <div className="text-xs text-blue-100">
                {equipment.length} items • {pricing.breakdown.length} types
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What&apos;s Included</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { title: "Professional Setup", desc: "Installation & config" },
                { title: "Technical Support", desc: "On-site support" },
                { title: "Quality Equipment", desc: "Professional gear" },
                { title: "Breakdown Service", desc: "Teardown & cleanup" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-xs">{item.title}</div>
                    <div className="text-xs text-gray-600 truncate">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">Ready to Book?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Contact Information</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-xs">📞</span>
                    <span className="text-gray-700 text-xs">(+855) 98 505079</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-xs">✉️</span>
                    <span className="text-gray-700 text-xs">visualemotion@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-xs">📍</span>
                    <span className="text-gray-700 text-xs">#633, St 75K, S/K Kakap, Khan Posenchey, Phnom Penh City</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xs">Next Steps</h4>
                <div className="space-y-1">
                  {[
                    "Contact us to confirm availability",
                    "Schedule a consultation", 
                    "Finalize your event details",
                    "Book your equipment"
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-xs">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-3 py-3 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            *Prices are estimates and may vary
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs px-3 py-1">
              Close
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500 text-white hover:from-blue-600 hover:via-blue-500 hover:to-purple-600 text-xs px-3 py-1">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
