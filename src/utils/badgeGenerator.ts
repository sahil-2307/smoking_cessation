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
  const svg = `<svg width="600" height="450" viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg" style="background: white;">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${badge.color}30;stop-opacity:1" />
          <stop offset="100%" style="stop-color:${badge.color};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="3" dy="6" stdDeviation="6" flood-color="#00000030"/>
        </filter>
      </defs>

      <!-- White Background -->
      <rect width="600" height="450" fill="white" />

      <!-- Main Badge Background -->
      <rect x="50" y="50" width="500" height="350" fill="url(#grad)" rx="25" filter="url(#shadow)"/>

      <!-- Border -->
      <rect x="65" y="65" width="470" height="320" fill="none" stroke="white" stroke-width="3" rx="20" opacity="0.6"/>

      <!-- Header -->
      <rect x="50" y="50" width="500" height="100" fill="${badge.color}" rx="25"/>
      <rect x="50" y="125" width="500" height="25" fill="${badge.color}"/>

      <!-- Icon Circle -->
      <circle cx="300" cy="100" r="35" fill="white" opacity="0.3"/>
      <text x="300" y="115" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle">${badge.icon}</text>

      <!-- Title -->
      <text x="300" y="200" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">${badge.title}</text>

      <!-- Subtitle -->
      <text x="300" y="235" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.9">${badge.subtitle}</text>

      <!-- Days Display -->
      <text x="300" y="295" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">${badge.days} DAYS</text>

      <!-- Username -->
      <text x="300" y="335" font-family="Arial, sans-serif" font-size="22" fill="white" text-anchor="middle" opacity="0.8">@${badge.username}</text>

      <!-- Date -->
      <text x="300" y="365" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.7">${badge.date}</text>

      <!-- QuitSmoking Branding -->
      <text x="75" y="385" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="start" opacity="0.6">🚭 QuitSmoking App</text>

      <!-- Achievement Badge Icon -->
      <circle cx="450" cy="375" r="20" fill="white" opacity="0.2"/>
      <text x="450" y="382" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">🏆</text>
    </svg>`

  return svg
}

export function downloadBadge(badge: BadgeData): void {
  const svg = generateBadgeSVG(badge)

  // Create a canvas to convert SVG to PNG for better compatibility
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  // Set canvas size (2x for high DPI)
  canvas.width = 1200
  canvas.height = 900

  if (ctx) {
    // Fill white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  img.onload = () => {
    if (ctx) {
      // Draw the SVG image onto the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${badge.title.replace(/\s+/g, '_')}_${badge.days}days_badge.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png', 1.0)
    }

    URL.revokeObjectURL(svgUrl)
  }

  img.onerror = () => {
    // Fallback to SVG download if canvas conversion fails
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${badge.title.replace(/\s+/g, '_')}_${badge.days}days_badge.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    URL.revokeObjectURL(svgUrl)
  }

  img.src = svgUrl
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