import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllHistory, getHistoryByType } from '../services/api'

const TYPE_FILTERS = [
  { label: '🔍 All',         value: '' },
  { label: '📏 Length',      value: 'LengthUnit' },
  { label: '⚖️ Weight',      value: 'WeightUnit' },
  { label: '🌡️ Temperature', value: 'TemperatureUnit' },
  { label: '🧪 Volume',      value: 'VolumeUnit' },
]

export default function Sidebar({ activePage, onNavigate, refreshTrigger, isLoggedIn }) {
  const navigate  = useNavigate()
  const [records, setRecords] = useState([])
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    if (isLoggedIn) fetchHistory()
  }, [filter, refreshTrigger, isLoggedIn])

  function fetchHistory() {
    if (filter) {
      getHistoryByType(filter)
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : []
          setRecords(data.reverse().slice(0, 20))
        })
        .catch(() => setRecords([]))
    } else {
      getAllHistory()
        .then(data => setRecords(data.reverse().slice(0, 20)))
        .catch(() => setRecords([]))
    }
  }

  const total   = records.length
  const success = records.filter(r => !r.isError).length

  const handleHistoryClick = () => {
    if (!isLoggedIn) {
      sessionStorage.setItem('returnTo', '/dashboard')
      sessionStorage.setItem('openHistory', 'true')
      navigate('/login')
    } else {
      onNavigate('history')
    }
  }

  return (
    <aside className="dashboard__sidebar">
      <div className="dashboard__sb-label">Navigation</div>

      <button
        className={`dashboard__nav-item ${activePage === 'calculator' ? 'dashboard__nav-item--active' : ''}`}
        onClick={() => onNavigate('calculator')}
      >🧮 Calculator</button>

      <button
        className={`dashboard__nav-item ${activePage === 'history' ? 'dashboard__nav-item--active' : ''}`}
        onClick={handleHistoryClick}
      >
        📋 History {!isLoggedIn && <span style={{ fontSize: '10px', color: '#f87171' }}>🔒</span>}
      </button>

      <div className="dashboard__divider" />

      {isLoggedIn ? (
        <>
          <div className="dashboard__sb-label">Filter History</div>
          <div style={{ padding: '0 8px' }}>
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                className={`dashboard__filter-pill ${filter === f.value ? 'dashboard__filter-pill--active' : ''}`}
                onClick={() => setFilter(f.value)}
              >{f.label}</button>
            ))}
          </div>

          <div className="dashboard__divider" />

          <div className="dashboard__sb-label">Recent</div>
          <div className="dashboard__history-scroll">
            {records.length === 0 ? (
              <div className="dashboard__no-hist">No history yet.<br />Do a calculation!</div>
            ) : (
              records.map((r, i) => (
                <div className="dashboard__hist-item" key={i}>
                  <div className="dashboard__hist-op">{r.operation || '—'}</div>
                  <div className="dashboard__hist-vals">{r.thisValue} {r.thisUnit} · {r.thatValue} {r.thatUnit}</div>
                  <div className={`dashboard__hist-res ${r.isError ? 'dashboard__hist-res--err' : ''}`}>
                    {r.isError ? '⚠ Error' : (r.resultString || r.resultValue)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="dashboard__stats-footer">
            <div className="dashboard__stat-box">
              <div className="dashboard__stat-num">{total}</div>
              <div className="dashboard__stat-lbl">Total</div>
            </div>
            <div className="dashboard__stat-box">
              <div className="dashboard__stat-num">{success}</div>
              <div className="dashboard__stat-lbl">Success</div>
            </div>
          </div>
        </>
      ) : (
        <div className="dashboard__no-hist" style={{ padding: '20px 16px', textAlign: 'center' }}>
          🔒 Please login to<br />view your history
        </div>
      )}
    </aside>
  )
}