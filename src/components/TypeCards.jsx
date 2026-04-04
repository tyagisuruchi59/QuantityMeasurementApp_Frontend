const TYPES = [
  { key: 'LengthUnit',      label: 'Length',      emoji: '📏' },
  { key: 'WeightUnit',      label: 'Weight',      emoji: '⚖️' },
  { key: 'TemperatureUnit', label: 'Temperature', emoji: '🌡️' },
  { key: 'VolumeUnit',      label: 'Volume',      emoji: '🧪' },
]

export default function TypeCards({ selected, onSelect }) {
  return (
    <div className="card">
      <div className="card__label">Choose Measurement Type</div>
      <div className="icon-grid icon-grid--4">
        {TYPES.map(({ key, label, emoji }) => (
          <button
            key={key}
            className={`icon-card ${selected === key ? `icon-card--${key}` : ''}`}
            onClick={() => onSelect(key)}
          >
            <span className="icon-card__emoji">{emoji}</span>
            <span className="icon-card__label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}