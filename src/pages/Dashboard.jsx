import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/api'
import useCalculator from '../hooks/useCalculator'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import TypeCards from '../components/TypeCards'
import ActionCards from '../components/ActionCards'
import Calculator from '../components/Calculator'
import HistoryTable from '../components/HistoryTable'

const OPERATOR_MAP = {
  compare: '=?', convert: '→',
  add: '+', subtract: '−', divide: '÷'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [theme, setTheme]           = useState('dark')
  const [activePage, setActivePage] = useState('calculator')
  const [operator, setOperator]     = useState('+')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const calc = useCalculator()

  const isLoggedIn = !!sessionStorage.getItem('accessToken')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (isLoggedIn && sessionStorage.getItem('openHistory') === 'true') {
      sessionStorage.removeItem('openHistory')
      setActivePage('history')
    }
  }, [isLoggedIn])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  const handleLogout = () => {
    const isGoogleUser = sessionStorage.getItem('isGoogleUser')
    if (!isGoogleUser) {
      logout().catch(() => {})
    }
    sessionStorage.clear()
    navigate('/')
  }

  const handleActionSelect = (action, symbol) => {
    calc.handleActionChange(action)
    setOperator(symbol || OPERATOR_MAP[action] || '+')
  }

  // ✅ FIXED — pass overrides through to calc.calculate
  const handleCalculate = (overrides) => {
    calc.calculate(overrides)
  }

  const handleNavigate = (page) => {
    if (page === 'history' && !isLoggedIn) {
      sessionStorage.setItem('returnTo', '/dashboard')
      sessionStorage.setItem('openHistory', 'true')
      navigate('/login')
      return
    }
    setActivePage(page)
  }

  return (
    <>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />
      <div className="dashboard">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          refreshTrigger={refreshTrigger}
          isLoggedIn={isLoggedIn}
        />
        <main className="dashboard__main">
          {activePage === 'calculator' && (
            <>
              <TypeCards
                selected={calc.measureType}
                onSelect={calc.handleTypeChange}
              />
              <ActionCards
                selected={calc.action}
                onSelect={handleActionSelect}
              />
              <Calculator
                value1={calc.value1}
                value2={calc.value2}
                unit1={calc.unit1}
                unit2={calc.unit2}
                setValue1={calc.setValue1}
                setValue2={calc.setValue2}
                setUnit1={calc.setUnit1}
                setUnit2={calc.setUnit2}
                units={calc.UNITS[calc.measureType]}
                operator={operator}
                onCalculate={handleCalculate}
                loading={calc.loading}
                result={calc.result}
                error={calc.error}
              />
            </>
          )}
          {activePage === 'history' && <HistoryTable />}
        </main>
      </div>
    </>
  )
}