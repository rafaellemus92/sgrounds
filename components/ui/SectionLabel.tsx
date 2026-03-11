'use client'

import { eyebrowStyle, helperStyle } from '@/lib/theme'

interface SectionLabelProps {
  label: string
  helper?: string
  right?: React.ReactNode
}

export default function SectionLabel({ label, helper, right }: SectionLabelProps) {
  return (
    <div style={{ marginBottom: helper ? '4px' : '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={eyebrowStyle}>{label}</span>
        {right}
      </div>
      {helper && (
        <p style={{ ...helperStyle, marginTop: '4px' }}>{helper}</p>
      )}
    </div>
  )
}
