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

  const handleInput = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!date || !selectedSlot || !form.name || !form.email || !form.phone) {
      alert('Заполни все поля и выбери слот')
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
      ...form,
    }

    setAppointments((prev) => [...prev, newAppointment])
    setSelectedSlot('')
    setForm({ name: '', email: '', phone: '' })
    alert('Запись успешно создана')
  }

  const handleDelete = (id) => {
    setAppointments((prev) => prev.filter((item) => item.id !== id))
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const left = `${a.date} ${a.time}`
    const right = `${b.date} ${b.time}`
    return left.localeCompare(right)
  })

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
            onChange={handleInput}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleInput}
          />

          <input
            name="phone"
            placeholder="Телефон"
            value={form.phone}
            onChange={handleInput}
          />

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
