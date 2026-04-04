const ACTIONS = [
  { key: 'compare',  label: 'Compare',  emoji: '⚖',  symbol: '=?' },
  { key: 'convert',  label: 'Convert',  emoji: '🔄', symbol: '→'  },
  { key: 'add',      label: 'Add',      emoji: '➕', symbol: '+'  },
  { key: 'subtract', label: 'Subtract', emoji: '➖', symbol: '−'  },
  { key: 'divide',   label: 'Divide',   emoji: '➗', symbol: '÷'  },
]

export default function ActionCards({ selected, onSelect }) {
  return (
    <div className="card">
      <div className="card__label">Choose Action</div>
      <div className="icon-grid icon-grid--5">
        {ACTIONS.map(({ key, label, emoji, symbol }) => (
          <button
            key={key}
            className={`icon-card ${selected === key ? `icon-card--${key}` : ''}`}
            onClick={() => onSelect(key, symbol)}
          >
            <span className="icon-card__emoji">{emoji}</span>
            <span className="icon-card__label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}