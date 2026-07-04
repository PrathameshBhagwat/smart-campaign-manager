import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContactStatsProps {
  stats: {
    total_contacts: number
    new_contacts: number
    contacted_contacts: number
    interested_contacts: number
    enrolled_contacts: number
  } | null
}

export function ContactStatsCards({ stats }: ContactStatsProps) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase text-muted-foreground">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_contacts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase text-muted-foreground">New</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.new_contacts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase text-muted-foreground">Contacted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.contacted_contacts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase text-muted-foreground">Interested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.interested_contacts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase text-muted-foreground">Enrolled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.enrolled_contacts}</div>
        </CardContent>
      </Card>
    </div>
  )
}
