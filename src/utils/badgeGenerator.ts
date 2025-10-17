export interface BadgeData {
  title: string
  subtitle: string
  days: number
  username: string
  date: string
  color: string
  icon: string
}

export function generateBadgeSVG(badge: BadgeData): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${badge.color}30;stop-opacity:1" />
          <stop offset="100%" style="stop-color:${badge.color};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#00000020"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="400" height="300" fill="url(#grad)" rx="20" filter="url(#shadow)"/>

      <!-- Border -->
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="white" stroke-width="2" rx="15" opacity="0.5"/>

      <!-- Header -->
      <rect x="0" y="0" width="400" height="80" fill="${badge.color}" rx="20"/>
      <rect x="0" y="60" width="400" height="20" fill="${badge.color}"/>

      <!-- Icon -->
      <circle cx="200" cy="40" r="25" fill="white" opacity="0.2"/>
      <text x="200" y="50" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">${badge.icon}</text>

      <!-- Title -->
      <text x="200" y="130" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">${badge.title}</text>

      <!-- Subtitle -->
      <text x="200" y="160" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.9">${badge.subtitle}</text>

      <!-- Days -->
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">${badge.days} DAYS</text>

      <!-- Username -->
      <text x="200" y="230" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">@${badge.username}</text>

      <!-- Date -->
      <text x="200" y="260" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.6">${badge.date}</text>

      <!-- QuitSmoking Branding -->
      <text x="30" y="285" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="start" opacity="0.5">QuitSmoking App</text>
    </svg>
  `.trim()

  return svg
}

export function downloadBadge(badge: BadgeData): void {
  const svg = generateBadgeSVG(badge)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${badge.title.replace(/\s+/g, '_')}_${badge.days}days.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getBadgeData(achievement: string, days: number, username: string): BadgeData {
  const badges: Record<string, Omit<BadgeData, 'days' | 'username' | 'date'>> = {
    'first_day': {
      title: 'First Day Warrior',
      subtitle: '24 Hours Smoke-Free!',
      color: '#10B981',
      icon: '🛡️'
    },
    'nicotine_fighter': {
      title: 'Nicotine Fighter',
      subtitle: 'Worst Cravings Behind You!',
      color: '#3B82F6',
      icon: '⚔️'
    },
    'week_champion': {
      title: 'Week Champion',
      subtitle: 'One Week Milestone!',
      color: '#8B5CF6',
      icon: '👑'
    },
    'month_hero': {
      title: 'Month Hero',
      subtitle: 'One Month Strong!',
      color: '#F59E0B',
      icon: '🏆'
    },
    'three_month_legend': {
      title: '3-Month Legend',
      subtitle: 'Incredible Achievement!',
      color: '#EF4444',
      icon: '🌟'
    },
    'year_master': {
      title: 'Year Master',
      subtitle: 'One Full Year!',
      color: '#6366F1',
      icon: '💎'
    }
  }

  const badgeConfig = badges[achievement] || badges['first_day']

  return {
    ...badgeConfig,
    days,
    username,
    date: new Date().toLocaleDateString()
  }
}