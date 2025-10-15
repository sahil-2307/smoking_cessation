import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red'
  trend?: {
    value: number
    label: string
  }
}

const colorClasses = {
  green: {
    bg: 'from-green-50 to-emerald-100',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    value: 'text-green-700',
    description: 'text-green-600'
  },
  blue: {
    bg: 'from-blue-50 to-cyan-100',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    value: 'text-blue-700',
    description: 'text-blue-600'
  },
  purple: {
    bg: 'from-purple-50 to-violet-100',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    title: 'text-purple-800',
    value: 'text-purple-700',
    description: 'text-purple-600'
  },
  orange: {
    bg: 'from-orange-50 to-amber-100',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    title: 'text-orange-800',
    value: 'text-orange-700',
    description: 'text-orange-600'
  },
  red: {
    bg: 'from-red-50 to-rose-100',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    value: 'text-red-700',
    description: 'text-red-600'
  }
}

export default function MetricsCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  trend
}: MetricsCardProps) {
  const classes = colorClasses[color]

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('money') || title.toLowerCase().includes('saved')) {
        return formatCurrency(val)
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <Card className={`bg-gradient-to-br ${classes.bg} ${classes.border}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${classes.title}`}>
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${classes.icon}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${classes.value} mb-1`}>
          {formatValue(value)}
        </div>
        <CardDescription className={`text-xs ${classes.description}`}>
          {description}
        </CardDescription>
        {trend && (
          <div className={`text-xs ${classes.description} mt-1`}>
            <span className="font-medium">
              {trend.value > 0 ? '+' : ''}{trend.value}
            </span>{' '}
            {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}