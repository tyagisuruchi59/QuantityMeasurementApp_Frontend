import { useState, useCallback, useRef } from 'react';
import { compare, convert, add, subtract, divide } from '../services/api';

const UNITS = {
  LengthUnit:      ['FEET', 'INCH', 'YARD', 'METER', 'CM'],
  WeightUnit:      ['KILOGRAM', 'GRAM', 'POUND', 'OUNCE'],
  VolumeUnit:      ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};

const ACTION_MAP = { compare, convert, add, subtract, divide };

export default function useCalculator() {
  const [measureType, setMeasureType] = useState('LengthUnit');
  const [action,      setAction]      = useState('add');
  const [value1,      setValue1]      = useState('1');
  const [value2,      setValue2]      = useState('1');
  const [unit1,       setUnit1]       = useState('FEET');
  const [unit2,       setUnit2]       = useState('INCH');
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const stateRef = useRef({});
  stateRef.current = { value1, value2, unit1, unit2, measureType, action };

  const handleTypeChange = useCallback((type) => {
    const units = UNITS[type];
    setMeasureType(type);
    setUnit1(units[0]);
    setUnit2(units[1] || units[0]);
    setResult(null);
    setError('');
  }, []);

  const handleActionChange = useCallback((act) => {
    setAction(act);
    setResult(null);
    setError('');
  }, []);

  const calculate = useCallback((overrides = {}) => {
    const s = stateRef.current;

    const v1 = parseFloat(overrides.value1 !== undefined ? overrides.value1 : s.value1);
    const v2 = parseFloat(overrides.value2 !== undefined ? overrides.value2 : s.value2);
    const u1 = overrides.unit1       !== undefined ? overrides.unit1       : s.unit1;
    const u2 = overrides.unit2       !== undefined ? overrides.unit2       : s.unit2;
    const mt = overrides.measureType !== undefined ? overrides.measureType : s.measureType;
    const ac = overrides.action      !== undefined ? overrides.action      : s.action;

    if (isNaN(v1) || isNaN(v2)) {
      setError('Please enter valid numbers!');
      return Promise.resolve();
    }

    setLoading(true);
    setError('');
    setResult(null);

    const body = {
      thisQuantityDTO: { value: v1, unit: u1, measurementType: mt },
      thatQuantityDTO: { value: v2, unit: u2, measurementType: mt }
    };

    return ACTION_MAP[ac](body)
      .then((res) => {
        const data = res.data;
        if (data.isError) setError(data.errorMessage || 'Calculation failed');
        else setResult(data);
      })
      .catch((err) => {
        setError(err.response?.data?.errorMessage || 'Server error. Is backend running?');
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    measureType, action, value1, value2, unit1, unit2,
    result, error, loading, UNITS,
    handleTypeChange, handleActionChange,
    setValue1, setValue2, setUnit1, setUnit2,
    calculate
  };
}