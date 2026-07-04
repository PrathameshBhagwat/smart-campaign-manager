'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface BusinessTypeChartProps {
  data?: Record<string, number>
}

const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#64748b']

export function BusinessTypeChart({ data }: BusinessTypeChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Business Demographics</CardTitle>
          <CardDescription>Messages generated per business vertical</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No Business Data Yet
        </CardContent>
      </Card>
    )
  }

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    value
  }))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Business Demographics</CardTitle>
        <CardDescription>Messages generated per business vertical</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value} Messages`, 'Generated']}
                contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
