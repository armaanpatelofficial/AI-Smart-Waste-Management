import { useState, useEffect } from 'react'
import MunicipalNavbar from '../../components/MunicipalNavbar.jsx'
import { complaintAPI } from '../../services/api.js'

const PRIORITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#4CAF50' }
const STATUS_COLOR   = { Pending: '#f59e0b', Resolved: '#4CAF50' }

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('All')
  const [search,     setSearch]     = useState('')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const data = await complaintAPI.getAll()
      // Map backend fields to frontend-friendly fields
      const mapped = data.map(c => ({
        id: c._id,
        issue: c.issueType,
        location: c.location,
        status: c.status,
        date: new Date(c.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        }),
        priority: c.priority,
        description: c.description,
        image: c.image
      }))
      setComplaints(mapped)
    } catch (err) {
      console.error('Failed to fetch complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  const resolve = async id => {
    try {
      await complaintAPI.resolve(id)
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c))
    } catch (err) {
      alert(err.message || 'Failed to resolve complaint')
    }
  }

  const pending  = complaints.filter(c => c.status === 'Pending').length
  const resolved = complaints.filter(c => c.status === 'Resolved').length

  const filtered = complaints
    .filter(c => filter === 'All' || c.status === filter)
    .filter(c =>
      c.issue.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-x-hidden pt-24 pb-12">
      <MunicipalNavbar />

      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-6 fade-in">
          <h1 className="font-baloo font-bold text-3xl text-gray-800">📢 Complaint Management</h1>
          <p className="text-gray-500 font-dm mt-1">Track and resolve citizen grievances</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            ['Total',    complaints.length, '#6b7280'],
            ['Pending',  pending,           '#f59e0b'],
            ['Resolved', resolved,          '#4CAF50'],
          ].map(([label, val, color]) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 border border-gray-100 text-center"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <p className="font-baloo font-bold text-3xl" style={{ color }}>{val}</p>
              <p className="text-sm text-gray-500 font-dm mt-1">{label} Complaints</p>
            </div>
          ))}
        </div>

        {/* Toolbar: filters + search */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          {/* Filter tabs */}
          <div className="flex gap-2">
            {['All', 'Pending', 'Resolved'].map(f => {
              const count = f === 'All' ? complaints.length : f === 'Pending' ? pending : resolved
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl font-dm font-medium text-sm transition-all"
                  style={{
                    background: filter === f ? 'linear-gradient(135deg,#1a3c5e,#0d2137)' : 'white',
                    color:      filter === f ? 'white' : '#6b7280',
                    border:     filter === f ? 'none' : '1px solid #e5e7eb',
                    boxShadow:  filter === f ? '0 4px 12px rgba(26,60,94,0.28)' : 'none',
                  }}
                >
                  {f} ({count})
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search issue or location…"
              className="pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm font-dm outline-none
                         focus:border-gov-blue transition-all"
              style={{ background: '#fafafa', minWidth: '220px' }}
            />
          </div>
        </div>

        {/* Complaints list */}
        <div className="space-y-3">
          {loading && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-gov-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-dm text-gray-400">Loading complaints...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div
              className="bg-white rounded-2xl p-12 text-center border border-gray-100"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <p className="text-4xl mb-3">🏢</p>
              <p className="font-dm font-medium text-gray-500">
                No {filter === 'All' ? '' : filter.toLowerCase()} complaints found. All issues might be resolved!
              </p>
            </div>
          )}

          {filtered.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 fade-in hover:shadow-md transition-all duration-200"
              style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start gap-5">
                {/* Image */}
                {c.image ? (
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                       onClick={() => window.open(`/uploads/${c.image}`, '_blank')}>
                    <img src={`/uploads/${c.image}`} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gray-50 flex items-center justify-center text-3xl flex-shrink-0">
                    📋
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-dm font-bold text-gray-400 tracking-wide">
                          {c.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-dm font-semibold text-white"
                          style={{ background: PRIORITY_COLOR[c.priority] || '#6b7280' }}
                        >
                          {c.priority} Priority
                        </span>
                        <span className="text-xs text-gray-400 font-dm">{c.date}</span>
                      </div>
                      <h3 className="font-dm font-semibold text-gray-800 text-base mb-1">{c.issue}</h3>
                      <p className="text-sm text-gray-500 font-dm mb-2">📍 {c.location}</p>
                      <p className="text-xs text-gray-400 font-dm italic line-clamp-2">{c.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className="px-3 py-1.5 rounded-xl text-sm font-dm font-semibold"
                        style={{
                          background: (STATUS_COLOR[c.status] || '#6b7280') + '20',
                          color:      STATUS_COLOR[c.status] || '#6b7280',
                        }}
                      >
                        {c.status === 'Pending' ? '⏳' : '✅'} {c.status}
                      </span>

                      {c.status === 'Pending' && (
                        <button
                          onClick={() => resolve(c.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-dm font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg,#4CAF50,#388E3C)' }}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
