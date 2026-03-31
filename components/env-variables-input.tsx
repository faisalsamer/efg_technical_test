'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EnvVar { key: string; value: string }

interface EnvVariablesInputProps {
  value: EnvVar[]
  onChange: (vars: EnvVar[]) => void
  disabled?: boolean
}

export function EnvVariablesInput({ value, onChange, disabled }: EnvVariablesInputProps) {
  return (
    <div className="space-y-3">
      <Label>Environment Variables</Label>
      {value.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-[#0b0f1a] p-3">
          {value.map((envVar, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="KEY"
                value={envVar.key}
                onChange={(e) => { const u = [...value]; u[index] = { ...u[index], key: e.target.value }; onChange(u) }}
                disabled={disabled}
                className="flex-1 font-mono text-xs"
              />
              <span className="text-slate-600 text-sm">=</span>
              <Input
                placeholder="value"
                value={envVar.value}
                onChange={(e) => { const u = [...value]; u[index] = { ...u[index], value: e.target.value }; onChange(u) }}
                disabled={disabled}
                className="flex-1 font-mono text-xs"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { key: '', value: '' }])} className="text-xs">
          + Add Variable
        </Button>
      )}
    </div>
  )
}
