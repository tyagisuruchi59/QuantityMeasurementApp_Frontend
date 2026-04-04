import { useState, useEffect, useRef } from 'react'

export default function Calculator({
  value1, value2, unit1, unit2,
  setValue1, setValue2, setUnit1, setUnit2,
  units, operator, onCalculate, loading, result, error
}) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied]       = useState(false)

  const [modalVal1,  setModalVal1]  = useState(value1)
  const [modalVal2,  setModalVal2]  = useState(value2)
  const [modalUnit1, setModalUnit1] = useState(unit1)
  const [modalUnit2, setModalUnit2] = useState(unit2)

  // ✅ Keep ref to always have latest modal values
  const modalRef = useRef({})
  modalRef.current = { modalVal1, modalVal2, modalUnit1, modalUnit2 }

  // Sync when modal opens
  useEffect(() => {
    if (showModal) {
      setModalVal1(value1)
      setModalVal2(value2)
      setModalUnit1(unit1)
      setModalUnit2(unit2)
    }
  }, [showModal])

 // DELETE the useEffect entirely — we don't need it anymore

const handleOpen = () => {
  // ✅ Sync modal values immediately before opening
  setModalVal1(value1)
  setModalVal2(value2)
  setModalUnit1(unit1)
  setModalUnit2(unit2)
  setShowModal(true)
  // ✅ Calculate with current page values directly
  onCalculate({
    value1: value1,
    value2: value2,
    unit1:  unit1,
    unit2:  unit2,
  })
}

  // ✅ Read from ref so values are always fresh
  const handleRecalculate = () => {
    const { modalVal1, modalVal2, modalUnit1, modalUnit2 } = modalRef.current
    setValue1(modalVal1)
    setValue2(modalVal2)
    setUnit1(modalUnit1)
    setUnit2(modalUnit2)
    onCalculate({
      value1: modalVal1,
      value2: modalVal2,
      unit1:  modalUnit1,
      unit2:  modalUnit2,
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getResultValue()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getResultValue = () => {
    if (!result) return ''
    if (result.operation === 'COMPARE')
      return result.resultValue === 1 ? 'Equal' : 'Not Equal'
    return Number(result.resultValue?.toFixed(6)).toString()
  }

  return (
    <>
      {/* Input card */}
      <div className="card">
        <div className="card__label">Enter Values</div>
        <div className="calc-inputs">

          <div>
            <label className="calc-inputs__label">Value 1</label>
            <input
              className="calc-inputs__number"
              type="number"
              value={value1}
              onChange={e => setValue1(e.target.value)}
            />
            <div className="unit-pills">
              {units.map(u => (
                <button key={u}
                  className={`unit-pill ${unit1 === u ? 'unit-pill--active' : ''}`}
                  onClick={() => setUnit1(u)}
                >{u}</button>
              ))}
            </div>
          </div>

          <div className="calc-inputs__operator">{operator}</div>

          <div>
            <label className="calc-inputs__label">Value 2</label>
            <input
              className="calc-inputs__number"
              type="number"
              value={value2}
              onChange={e => setValue2(e.target.value)}
            />
            <div className="unit-pills">
              {units.map(u => (
                <button key={u}
                  className={`unit-pill ${unit2 === u ? 'unit-pill--active' : ''}`}
                  onClick={() => setUnit2(u)}
                >{u}</button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Calculate button */}
      <button className="calc-btn-float" onClick={handleOpen} disabled={loading}>
        {loading
          ? <><div className="btn-spinner" /> Calculating...</>
          : <>⚡ Calculate</>
        }
      </button>

      {/* ══ MODAL POPUP ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal__title">⚡ Calculate</div>

            {/* Editable values */}
            <div className="modal__edit-row">
              <div className="modal__edit-block">
                <label className="modal__edit-label">Value 1</label>
                <input
                  className="modal__edit-input"
                  type="number"
                  value={modalVal1}
                  onChange={e => setModalVal1(e.target.value)}
                />
                <div className="modal__unit-pills">
                  {units.map(u => (
                    <button key={u}
                      className={`modal__unit-pill ${modalUnit1 === u ? 'modal__unit-pill--active' : ''}`}
                      onClick={() => setModalUnit1(u)}
                    >{u}</button>
                  ))}
                </div>
              </div>

              <div className="modal__op">{operator}</div>

              <div className="modal__edit-block">
                <label className="modal__edit-label">Value 2</label>
                <input
                  className="modal__edit-input"
                  type="number"
                  value={modalVal2}
                  onChange={e => setModalVal2(e.target.value)}
                />
                <div className="modal__unit-pills">
                  {units.map(u => (
                    <button key={u}
                      className={`modal__unit-pill ${modalUnit2 === u ? 'modal__unit-pill--active' : ''}`}
                      onClick={() => setModalUnit2(u)}
                    >{u}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign:'center', padding:'20px', color:'var(--muted)' }}>
                <div className="btn-spinner"
                  style={{ margin:'0 auto 10px', width:'26px', height:'26px', borderWidth:'3px' }}
                />
                <div style={{ fontSize:'13px' }}>Calculating...</div>
              </div>
            )}

            {/* Result */}
            {!loading && result && !error && (
              <div className="modal__result">
                <div className="modal__result-lbl">Result</div>
                <div className="modal__result-val">{getResultValue()}</div>
                <div className="modal__result-str">
                  {result.resultString ||
                    `${result.resultUnit || ''} ${result.resultMeasurementType || ''}`}
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="modal__error">⚠️ {error}</div>
            )}

            {/* Action buttons */}
            {!loading && (
              <div className="modal__actions">
                <button
                  className="modal__action-btn modal__action-btn--recalc"
                  onClick={handleRecalculate}
                >
                  🔄 Recalculate
                </button>
                <button
                  className="modal__action-btn modal__action-btn--copy"
                  onClick={handleCopy}
                  disabled={!result}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Result'}
                </button>
                <button
                  className="modal__action-btn modal__action-btn--close"
                  onClick={() => setShowModal(false)}
                  style={{ gridColumn: 'span 2' }}
                >
                  ✕ Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}