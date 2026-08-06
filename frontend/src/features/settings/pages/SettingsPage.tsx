import { useState } from 'react'
import { useData } from '../../../context/DataContext'

export default function SettingsPage() {
  const { auditLog, users } = useData()
  const [activeTab, setActiveTab] = useState('audit')

  // Helper to format timestamps
  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  // Helper to get user name from ID
  const getUserName = (userId: number | string | null) => {
    if (!userId) return 'System'
    const user = (users as any[]).find(u => String(u.userId) === String(userId))
    if (user) return user.fullName || user.username
    return isNaN(Number(userId)) ? String(userId) : `User #${userId}`
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA]">
      {/* Page Header */}
      <div className="px-8 py-6 bg-white border-b border-[#D1D7CE] flex-shrink-0">
        <h1 className="text-3xl font-bold font-serif text-[#322A2C]">Settings & Administration</h1>
        <p className="text-sm text-slate-500 font-sans mt-1">
          System configuration and security audit logs
        </p>
      </div>

      {/* Tabs */}
      <div className="px-8 pt-4 bg-white border-b border-[#D1D7CE] flex-shrink-0 flex space-x-6">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'audit' ? 'border-[#322A2C] text-[#322A2C]' : 'border-transparent text-slate-400 hover:text-[#322A2C]'
          }`}
        >
          System Audit Log
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'system' ? 'border-[#322A2C] text-[#322A2C]' : 'border-transparent text-slate-400 hover:text-[#322A2C]'
          }`}
        >
          System Info
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'system' && (
          <div className="max-w-3xl">
            <h3 className="text-lg font-serif font-bold text-[#322A2C] mb-4">System Information</h3>
            <div className="bg-white border border-[#D1D7CE] rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">System Name</label>
                  <div className="text-sm font-semibold text-[#322A2C]">Barangay Profiling System</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Version</label>
                  <div className="text-sm font-semibold text-[#322A2C]">v2.1.0-staging</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Assigned Location</label>
                  <div className="text-sm font-semibold text-[#322A2C]">Barangay 46 Zone 6</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Municipality / City</label>
                  <div className="text-sm font-semibold text-[#322A2C]">Pasay City</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Database Status</label>
                  <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected (Supabase)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white border border-[#D1D7CE] rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
              <table className="ledger-table w-full">
                <thead>
                  <tr>
                    <th className="w-16">Log ID</th>
                    <th className="w-48">Timestamp</th>
                    <th className="w-32">Action</th>
                    <th className="w-48">Table</th>
                    <th className="w-32">Record ID</th>
                    <th>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {!(auditLog as any[])?.length ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 font-serif italic bg-white">
                        No audit log entries found.
                      </td>
                    </tr>
                  ) : (
                    ([...(auditLog as any[])]).map((entry) => (
                      <tr key={entry.auditId}>
                        <td className="font-mono text-[10px] text-slate-400">{entry.auditId}</td>
                        <td className="font-mono text-[11px] text-slate-500">{formatTimestamp(entry.performedAt)}</td>
                        <td>
                          <span className={`inline-flex px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase border ${
                            entry.actionType === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            entry.actionType === 'UPDATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            entry.actionType === 'DELETE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {entry.actionType}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-[#322A2C]">{entry.tableName}</td>
                        <td className="font-mono text-[11px] text-slate-500">{entry.recordId}</td>
                        <td className="text-xs font-semibold text-[#322A2C]">{getUserName(entry.performedBy)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
