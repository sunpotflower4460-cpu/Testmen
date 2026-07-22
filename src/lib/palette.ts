import type { InkColor } from './types.js'

export const INK_COLORS: InkColor[] = [
  { id: 'vermilion', name: '朱', ink: '#e0402f', tint: '#fbe7e2' },
  { id: 'indigo', name: '藍', ink: '#2f5aa8', tint: '#e2e9f5' },
  { id: 'matcha', name: '抹茶', ink: '#5a8a3c', tint: '#e7f0dd' },
  { id: 'sumi', name: '墨', ink: '#3a3a3a', tint: '#e6e6e6' },
  { id: 'yamabuki', name: '山吹', ink: '#e0972f', tint: '#fbeed6' },
  { id: 'murasaki', name: '紫', ink: '#8a4fb0', tint: '#efe4f6' },
  { id: 'peacock', name: '孔雀', ink: '#1f8a8a', tint: '#dcf0f0' },
  { id: 'momo', name: '桃', ink: '#dd5a86', tint: '#fce1ea' },
]

export const DEFAULT_COLOR_ID = INK_COLORS[0].id
const FALLBACK = INK_COLORS[0]

export function getColor(colorId: string): InkColor {
  return INK_COLORS.find((c) => c.id === colorId) ?? FALLBACK
}

export const EMOJI_CHOICES = [
  '✓', '🔥', '💪', '📖', '🏃', '🧘', '💧', '🥗',
  '😴', '🦷', '🧹', '✍️', '🎸', '🎨', '🌱', '☀️',
  '💰', '📵', '🚭', '🍵', '🐾', '⭐', '❤️', '🧠',
]
