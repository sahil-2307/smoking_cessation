import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

export function calculateQuitStats(quitDate: string, cigarettesPerDay: number, costPerPack: number, cigarettesPerPack: number = 20) {
  const quit = new Date(quitDate)
  const now = new Date()

  if (quit > now) {
    return {
      days_smoke_free: 0,
      hours_smoke_free: 0,
      minutes_smoke_free: 0,
      money_saved: 0,
      cigarettes_not_smoked: 0,
      time_regained_hours: 0
    }
  }

  const days = differenceInDays(now, quit)
  const hours = differenceInHours(now, quit)
  const minutes = differenceInMinutes(now, quit)

  const cigarettesNotSmoked = days * cigarettesPerDay
  const packsNotBought = cigarettesNotSmoked / cigarettesPerPack
  const moneySaved = packsNotBought * costPerPack

  // Average time per cigarette is about 5 minutes
  const timeRegainedHours = (cigarettesNotSmoked * 5) / 60

  return {
    days_smoke_free: days,
    hours_smoke_free: hours,
    minutes_smoke_free: minutes,
    money_saved: Math.round(moneySaved),
    cigarettes_not_smoked: Math.round(cigarettesNotSmoked),
    time_regained_hours: Math.round(timeRegainedHours)
  }
}

export function getTimeSinceQuit(quitDate: string) {
  const quit = new Date(quitDate)
  const now = new Date()

  if (quit > now) {
    return { days: 0, hours: 0, minutes: 0, isInFuture: true }
  }

  const totalMinutes = differenceInMinutes(now, quit)
  const totalHours = differenceInHours(now, quit)
  const days = differenceInDays(now, quit)

  const hours = totalHours % 24
  const minutes = totalMinutes % 60

  return { days, hours, minutes, isInFuture: false }
}

export function formatCurrency(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
  const symbols = { INR: '₹', USD: '$' }
  return `${symbols[currency]}${amount.toLocaleString()}`
}

export function getHealthMilestoneProgress(quitDate: string) {
  const quit = new Date(quitDate)
  const now = new Date()
  const minutesSinceQuit = differenceInMinutes(now, quit)
  const hoursSinceQuit = differenceInHours(now, quit)
  const daysSinceQuit = differenceInDays(now, quit)

  const milestones = [
    { key: '20_minutes', achieved: minutesSinceQuit >= 20 },
    { key: '12_hours', achieved: hoursSinceQuit >= 12 },
    { key: '2_weeks', achieved: daysSinceQuit >= 14 },
    { key: '1_month', achieved: daysSinceQuit >= 30 },
    { key: '3_months', achieved: daysSinceQuit >= 90 },
    { key: '1_year', achieved: daysSinceQuit >= 365 },
    { key: '5_years', achieved: daysSinceQuit >= 1825 }
  ]

  return milestones
}

export function calculateStreak(progressData: Array<{ date: string; is_smoke_free: boolean }>) {
  if (!progressData.length) return 0

  // Sort by date descending
  const sorted = progressData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  let streak = 0
  for (const progress of sorted) {
    if (progress.is_smoke_free) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function generateMotivationalMessage(daysSmokerFree: number): string {
  if (daysSmokerFree === 0) return "Today is the beginning of your new life!"
  if (daysSmokerFree === 1) return "You did it! One full day smoke-free!"
  if (daysSmokerFree < 7) return `${daysSmokerFree} days strong! Keep going!`
  if (daysSmokerFree < 30) return `${daysSmokerFree} days of freedom! You're amazing!`
  if (daysSmokerFree < 90) return `${daysSmokerFree} days smoke-free! You've got this!`
  if (daysSmokerFree < 365) return `${daysSmokerFree} days of pure victory!`

  const years = Math.floor(daysSmokerFree / 365)
  const remainingDays = daysSmokerFree % 365

  if (years === 1 && remainingDays === 0) return "One full year smoke-free! Incredible achievement!"
  if (years >= 1) return `${years} year${years > 1 ? 's' : ''} and ${remainingDays} days smoke-free! Legend!`

  return "You're doing amazing! Keep it up!"
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' }
  if (score <= 4) return { score, label: 'Fair', color: 'text-yellow-500' }
  if (score <= 5) return { score, label: 'Good', color: 'text-green-500' }
  return { score, label: 'Strong', color: 'text-green-600' }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}