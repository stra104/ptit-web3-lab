
import { createGlobalState } from 'react-hooks-global-state'

// =====================================
// 1. GLOBAL STATE
// =====================================

const {
  setGlobalState,
  useGlobalState,
  getGlobalState,
} = createGlobalState({
  createModal: 'scale-0',
  connectedAccount: '',
  contract: null,
  proposals: [],
  isStakeholder: false,
  balance: 0,
  mybalance: 0,
})

// =====================================
// 2. RUT GON DIA CHI VI
// =====================================

const truncate = (
  text,
  startChars,
  endChars,
  maxLength
) => {
  if (!text) return ''

  if (text.length > maxLength) {
    const start = text.substring(0, startChars)

    const end = text.substring(
      text.length - endChars
    )

    return `${start}...${end}`
  }

  return text
}

// =====================================
// 3. TINH THOI GIAN CON LAI
// =====================================

const daysRemaining = (timestamp) => {
  if (!timestamp) return '...'

  const remaining =
    Number(timestamp) * 1000 - Date.now()

  if (remaining <= 0) {
    return 'Expired'
  }

  // Duoi 60 phut
  const minutes = Math.ceil(remaining / 60000)

  if (minutes < 60) {
    return `${minutes} minutes`
  }

  // Tu 1 gio den duoi 24 gio
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours < 24) {
    return `${hours} hours ${remainingMinutes} minutes`
  }

  // Tu 24 gio tro len
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  return `${days} days ${remainingHours} hours`
}

// =====================================
// 4. EXPORT FUNCTIONS
// =====================================

export {
  truncate,
  setGlobalState,
  useGlobalState,
  getGlobalState,
  daysRemaining,
}
