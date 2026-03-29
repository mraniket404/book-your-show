import React from 'react'

const Seat = ({ seat, isSelected, isBooked, isHold, onSelect }) => {
  const getClass = () => {
    if (isBooked) return 'seat-booked'
    if (isHold) return 'seat-hold'
    if (isSelected) return 'seat-selected'
    if (seat.type === 'premium') return 'seat-premium'
    if (seat.type === 'recliner') return 'seat-recliner'
    return 'seat-normal'
  }

  return (
    <button className={`seat ${getClass()}`} onClick={() => !isBooked && !isHold && onSelect(seat)} disabled={isBooked || isHold}>
      {seat.number}
    </button>
  )
}

export default Seat