import { auditLog, barangays } from '@/mocks'

export default function SettingsPage() {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#16324A]">Settings &amp; Administration</h1>
        <p className="text-sm text-slate-500 font-sans">
          Configure local parameters, staff permissions, and registry stamp templates
        </p>
      </div>

      <div className="ledger-container p-5 space-y-6">
        {/* Section 1: Barangay Details */}
        <div>
          <h3 className="text-sm font-serif font-bold text-[#16324A] border-b border-[#D1D7CE] pb-2 mb-3">
            Barangay Profiles Config
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {(barangays as Array<Record<string, unknown>>).map((brgy) => (
              <div key={brgy.id as string} className="bg-[#F9FAF8] border border-[#D1D7CE] p-3 rounded-xs">
                <p className="font-bold text-[#16324A]">{brgy.name as string}</p>
                <p className="text-slate-500 mt-1">Sector Code: {brgy.code as string ?? `BRGY-${brgy.id}`}</p>
                <p className="text-slate-500">Official Seal Symbol: 🏛️</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Stamp Seal Previews */}
        <div>
          <h3 className="text-sm font-serif font-bold text-[#16324A] border-b border-[#D1D7CE] pb-2 mb-3">
            Registry Stamp Seals Preview
          </h3>
          <div className="flex items-center space-x-6">
            {(['seal-stamped-active', 'seal-stamped-inactive', 'seal-stamped-gold'] as const).map((cls) => (
              <div key={cls} className="flex flex-col items-center p-3 border border-[#D1D7CE] rounded bg-white">
                <span className={cls}>{cls.split('-').pop()?.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">{cls}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Audit Log */}
        <div>
          <h3 className="text-sm font-serif font-bold text-[#16324A] border-b border-[#D1D7CE] pb-2 mb-2">
            System Audit Log
          </h3>
          {(auditLog as Array<Record<string, unknown>>).length > 0 ? (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {([...(auditLog as Array<Record<string, unknown>>)]).reverse().slice(0, 20).map((entry) => (
                <div key={entry.auditId as string} className="flex items-center justify-between text-xs py-1.5 border-b border-[#D1D7CE]/40">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(entry.performedAt as string).toLocaleString()}
                    </span>
                    <span className="text-slate-600">
                      <strong className="text-[#16324A]">{entry.actionType as string}</strong>
                      {' '}on <span className="font-mono">{entry.tableName as string}</span>
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{entry.recordId as string}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-2">
              No audit log entries yet. Actions will be logged as you use the system.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
