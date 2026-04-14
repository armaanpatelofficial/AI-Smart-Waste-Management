import { useState } from 'react'
import PublicNavbar from '../../components/PublicNavbar.jsx'
import { complaintAPI } from '../../services/api.js'

const ISSUE_TYPES = [
  'Bin Overflow', 'Missed Collection', 'Vahan Not Arriving',
  'Littering', 'Illegal Dumping', 'Damaged Bin', 'Bad Odour', 'Other',
]

const EMPTY = { name: '', location: '', issueType: '', description: '', image: null }

export default function ReportIssue() {
  const [form,      setForm]      = useState(EMPTY)
  const [preview,   setPreview]   = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [respId,    setRespId]    = useState('')

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onImage = e => {
    const f = e.target.files[0]
    if (f) { setForm(p => ({ ...p, image: f })); setPreview(URL.createObjectURL(f)) }
  }

  const onSubmit = async () => {
    if (!form.name || !form.location || !form.issueType || !form.description) {
      alert('Please fill all required fields!')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('location', form.location)
      fd.append('issueType', form.issueType)
      fd.append('description', form.description)
      if (form.image) fd.append('image', form.image)

      const res = await complaintAPI.create(fd)
      setRespId(res._id)
      setSubmitted(true)
    } catch (err) {
      alert(err.message || 'Submission failed')
      console.log("Error: ", err);
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="min-h-screen bg-bg-main">
      <PublicNavbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center fade-in">
        <div className="bg-white rounded-3xl p-12 border border-gray-100"
          style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.08)' }}>
          <p className="text-7xl mb-4">✅</p>
          <h2 className="font-baloo font-bold text-3xl text-gray-800 mb-2">Complaint Submitted!</h2>
          <p className="text-gray-500 font-dm mb-2">
            Complaint ID:{' '}
            <strong className="text-green-600">
              {respId ? respId.slice(-8).toUpperCase() : 'SUBMITTED'}
            </strong>
          </p>
          <p className="text-gray-500 font-dm mb-8">Our team will respond within 24 hours.</p>
          <button
            onClick={() => { setSubmitted(false); setForm(EMPTY); setPreview(null) }}
            className="px-8 py-3 rounded-2xl font-dm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#4CAF50,#388E3C)' }}
          >
            Submit Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-main">
      <PublicNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <h1 className="font-baloo font-bold text-3xl text-gray-800">📋 Grievance &amp; Complaint Portal</h1>
          <p className="text-gray-500 font-dm mt-1">Report waste management issues in your area</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Name + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[['name','Full Name *','Enter your name'], ['location','Location *','Area, Block, Street']].map(([n,l,p]) => (
              <div key={n}>
                <label className="block text-sm font-dm font-semibold text-gray-700 mb-2">{l}</label>
                <input
                  name={n} value={form[n]} onChange={onChange} placeholder={p}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-dm text-sm outline-none
                             focus:border-green-400 transition-all"
                  style={{ background: '#fafafa' }}
                />
              </div>
            ))}
          </div>

          {/* Issue type */}
          <div>
            <label className="block text-sm font-dm font-semibold text-gray-700 mb-2">Issue Type *</label>
            <select
              name="issueType" value={form.issueType} onChange={onChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-dm text-sm outline-none
                         focus:border-green-400 transition-all appearance-none"
              style={{ background: '#fafafa' }}
            >
              <option value="">Select issue type…</option>
              {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-dm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description" value={form.description} onChange={onChange}
              placeholder="Describe the issue in detail…" rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-dm text-sm outline-none
                         focus:border-green-400 transition-all resize-none"
              style={{ background: '#fafafa' }}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-dm font-semibold text-gray-700 mb-2">
              Upload Image (Optional)
            </label>
            <div
              className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all"
              style={{
                borderColor: preview ? '#4CAF50' : '#e5e7eb',
                background:  preview ? '#f0fdf4' : '#fafafa',
              }}
              onClick={() => document.getElementById('report-img').click()}
            >
              {preview
                ? <img src={preview} alt="Evidence" className="w-full max-h-40 object-cover rounded-lg" />
                : (
                  <div className="py-4">
                    <p className="text-3xl mb-2">📸</p>
                    <p className="text-sm font-dm text-gray-500">Click to upload evidence photo</p>
                  </div>
                )
              }
            </div>
            <input id="report-img" type="file" accept="image/*" onChange={onImage} className="hidden" />
          </div>

          {/* Submit */}
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-dm font-semibold text-white transition-all
                       flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg,#4CAF50,#388E3C)',
              boxShadow: '0 4px 20px rgba(76,175,80,0.35)',
            }}
          >
            {loading ? <><div className="spinner" /> Submitting…</> : '🚀 Submit Complaint'}
          </button>

          <p className="text-center text-xs text-gray-400 font-dm">
            Your complaint will be tracked and resolved within 24 hours
          </p>
        </div>
      </div>
    </div>
  )
}
