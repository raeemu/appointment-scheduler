import { useEffect, useMemo, useState } from 'react'
import './index.css'

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function App() {
  const [date, setDate] = useState(getToday())
  const [selectedSlot, setSelectedSlot] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  })

  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('appointments')
    if (saved) {
      setAppointments(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments))
  }, [appointments])

  const takenSlots = useMemo(() => {
    return appointments
      .filter((item) => item.date === date)
      .map((item) => item.time)
  }, [appointments, date])

  const validateField = (name, value) => {
    const trimmed = typeof value === 'string' ? value.trim() : value

    switch (name) {
      case 'name': {
        if (!trimmed) return 'Укажите имя'
        const nameRegex = /^[A-Za-zА-Яа-яЁё\s-]+$/
        if (!nameRegex.test(trimmed)) {
          return 'Некорректное имя. Разрешены только буквы, пробелы и дефисы.'
        }
        return ''
      }
      case 'email': {
        if (!trimmed) return 'Укажите email'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmed)) return 'Некорректный email. Пример: example@example.com'
        return ''
      }
      case 'phone': {
        if (!trimmed) return 'Укажите телефон'
        const phoneRegex = /^\+?\d{7,15}$/
        if (!phoneRegex.test(trimmed)) {
          return 'Некорректный телефон. Разрешены только цифры и знак +, от 7 до 15 символов.'
        }
        return ''
      }
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      phone: validateField('phone', form.phone),
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      email: true,
      phone: true,
    })

    return !newErrors.name && !newErrors.email && !newErrors.phone
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    let newValue = value

    if (name === 'phone') {
      newValue = value.replace(/[^\d+]/g, '')
    }

    setForm((prev) => ({ ...prev, [name]: newValue }))

    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target

    setTouched((prev) => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!date || !selectedSlot) {
      alert('Выбери дату и слот')
      return
    }

    if (!validateForm()) {
      return
    }

    const exists = appointments.some(
      (item) => item.date === date && item.time === selectedSlot
    )

    if (exists) {
      alert('Этот слот уже занят')
      return
    }

    const newAppointment = {
      id: crypto.randomUUID(),
      date,
      time: selectedSlot,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    }

    setAppointments((prev) => [...prev, newAppointment])
    setSelectedSlot('')
    setForm({ name: '', email: '', phone: '' })
    setTouched({ name: false, email: false, phone: false })
    setErrors({ name: '', email: '', phone: '' })
    alert('Запись успешно создана')
  }

  const handleDelete = (id) => {
    setAppointments((prev) => prev.filter((item) => item.id !== id))
  }

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const left = `${a.date} ${a.time}`
      const right = `${b.date} ${b.time}`
      return left.localeCompare(right)
    })
  }, [appointments])

  return (
    <div className="page">
      <div className="card">
        <h1>Appointment Scheduler</h1>
        <p className="subtitle">
          Выберите дату, свободный слот и оставьте контактные данные.
        </p>

        <div className="section">
          <label className="label">Дата записи</label>
          <input
            type="date"
            value={date}
            min={getToday()}
            onChange={(e) => {
              setDate(e.target.value)
              setSelectedSlot('')
            }}
          />
        </div>

        <div className="section">
          <p className="label">Доступные слоты</p>
          <div className="slots">
            {TIME_SLOTS.map((slot) => {
              const isTaken = takenSlots.includes(slot)
              const isActive = selectedSlot === slot

              return (
                <button
                  key={slot}
                  type="button"
                  className={`slot ${isActive ? 'active' : ''}`}
                  disabled={isTaken}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot} {isTaken ? '— занято' : ''}
                </button>
              )
            })}
          </div>
        </div>

        <form className="section form" onSubmit={handleSubmit}>
          <p className="label">Контактные данные</p>

          <input
            name="name"
            placeholder="Имя"
            value={form.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={
              errors.name && touched.name ? 'input error' : 'input'
            }
          />
          {errors.name && touched.name && (
            <p className="error-text">{errors.name}</p>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={
              errors.email && touched.email ? 'input error' : 'input'
            }
          />
          {errors.email && touched.email && (
            <p className="error-text">{errors.email}</p>
          )}

          <input
            name="phone"
            placeholder="Телефон"
            value={form.phone}
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputMode="tel"
            className={
              errors.phone && touched.phone ? 'input error' : 'input'
            }
          />
          {errors.phone && touched.phone && (
            <p className="error-text">{errors.phone}</p>
          )}

          <button className="submit" type="submit">
            Подтвердить запись
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Созданные записи</h2>

        {sortedAppointments.length === 0 ? (
          <p className="empty">Пока нет ни одной записи.</p>
        ) : (
          <ul className="appointments">
            {sortedAppointments.map((item) => (
              <li key={item.id} className="appointment">
                <div>
                  <strong>{item.date}</strong> — {item.time}
                  <br />
                  {item.name}, {item.email}, {item.phone}
                </div>
                <button
                  className="delete"
                  type="button"
                  onClick={() => handleDelete(item.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
