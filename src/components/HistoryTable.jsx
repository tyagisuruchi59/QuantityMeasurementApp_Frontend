import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllHistory, getHistoryByType } from '../services/api'

const TYPE_FILTERS = ['', 'LengthUnit', 'WeightUnit', 'TemperatureUnit', 'VolumeUnit']
const OP_FILTERS   = ['', 'ADD', 'SUBTRACT', 'DIVIDE', 'COMPARE', 'CONVERT']

export default function HistoryTable() {
  const navigate = useNavigate()
  const [records, setRecords]       = useState([])
  const [typeFilter, setTypeFilter] = useState('')
  const [opFilter, setOpFilter]     = useState('')
  const [loading, setLoading]       = useState(true)

  const isLoggedIn = !!sessionStorage.getItem('accessToken')

  useEffect(() => {
    if (isLoggedIn) fetchHistory()
    else setLoading(false)
  }, [typeFilter])

  function fetchHistory() {
    setLoading(true)
    const fetcher = typeFilter
      ? getHistoryByType(typeFilter).then(r => Array.isArray(r.data) ? r.data : [])
      : getAllHistory()

    fetcher
      .then(data => setRecords(data.reverse()))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }

  // If not logged in show login prompt
  if (!isLoggedIn) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '400px', gap: '16px'
      }}>
        <div style={{ fontSize: '64px' }}>🔒</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
          Login Required
        </div>
        <div style={{ fontSize: '14px', color: 'var(--muted)', textAlign: 'center' }}>
          You need to be logged in to view your history.
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    )
  }

  const filtered = opFilter
    ? records.filter(r => r.operation?.toUpperCase() === opFilter)
    : records

  return (
    <div className="card">
      <div className="card__label">Calculation History</div>

      <div className="hist-filter-bar">
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            className={`hist-filter-pill ${typeFilter === f ? 'hist-filter-pill--active' : ''}`}
            onClick={() => setTypeFilter(f)}
          >
            {f === '' ? '🔍 All Types' : f.replace('Unit', '')}
          </button>
        ))}
      </div>

      <div className="hist-filter-bar">
        {OP_FILTERS.map(f => (
          <button
            key={f}
            className={`hist-filter-pill ${opFilter === f ? 'hist-filter-pill--active' : ''}`}
            onClick={() => setOpFilter(f)}
          >
            {f === '' ? 'All Ops' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="no-data">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="no-data">No history found</div>
      ) : (
        <table className="hist-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Operation</th>
              <th>Value 1</th>
              <th>Value 2</th>
              <th>Result</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td>{r.thisMeasurementType?.replace('Unit', '') || '—'}</td>
                <td>{r.operation || '—'}</td>
                <td>{r.thisValue} {r.thisUnit}</td>
                <td>{r.thatValue} {r.thatUnit}</td>
                <td><strong>{r.isError ? '—' : (r.resultString || r.resultValue)}</strong></td>
                <td>
                  <span className={`badge badge--${r.isError ? 'err' : 'ok'}`}>
                    {r.isError ? '❌ Error' : '✅ OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}