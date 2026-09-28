export const TURN_SECONDS = 15
export const SOLVE_BONUS = 1000
export const SPIN_SECONDS = 3.5
export const RESULT_MS = 2000

export const TEAMS = [
  { name: 'Đội 1', color: '#D2513F', tint: '#EC7A67' },
  { name: 'Đội 2', color: '#3AA396', tint: '#5BC4B6' },
  { name: 'Đội 3', color: '#D9A13E', tint: '#EDBE66' },
  { name: 'Đội 4', color: '#6273C4', tint: '#8E9CE6' },
]

export const WHEEL_SEGMENTS = [
  { id: 1, label: '200', type: 'score', value: 200, fill: '#2B2924' },
  { id: 2, label: 'MẤT LƯỢT', type: 'lose_turn', fill: '#57524A', text: '#EFE8D8' },
  { id: 3, label: '500', type: 'score', value: 500, fill: '#34312B' },
  { id: 4, label: 'NHÂN ĐÔI', type: 'multiply', value: 2, fill: '#9B2C20', text: '#EFE8D8' },
  { id: 5, label: '100', type: 'score', value: 100, fill: '#2B2924' },
  { id: 6, label: 'PHÁ SẢN', type: 'bankrupt', fill: '#0A0A09', text: '#E2583E' },
  { id: 7, label: '300', type: 'score', value: 300, fill: '#34312B' },
  { id: 8, label: '800', type: 'score', value: 800, fill: '#2B2924' },
  { id: 9, label: 'MẤT LƯỢT', type: 'lose_turn', fill: '#57524A', text: '#EFE8D8' },
  { id: 10, label: '1000', type: 'score', value: 1000, fill: '#34312B' },
]

// Vietnamese does not use F, J, W or Z, so they are left off the board.
export const KEYBOARD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'K', 'L', 'M'],
  ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y'],
]
