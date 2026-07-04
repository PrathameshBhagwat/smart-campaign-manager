'use client';

import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { DailyTrend, CostAnalytics, ProviderAnalytics, ChannelAnalytics, BulkAnalytics } from '@/types/dashboard';
import { CampaignAnalytics } from '@/types/dashboard';

const COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-muted-foreground)'];

export function TrendChart({ data }: { data: DailyTrend[] }) {
  if (!data || data.length === 0) return <EmptyChart message="No trend data available" />;
  
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">AI Generation Trends</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="count" name="Messages" stroke="var(--color-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CostChart({ data }: { data: CostAnalytics }) {
  if (!data) return <EmptyChart message="No cost data available" />;
  
  const chartData = [
    { name: 'Today', cost: data.today },
    { name: '7 Days', cost: data.week },
    { name: '30 Days', cost: data.month }
  ];

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">Estimated Cost (USD)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Cost']}
              contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="cost" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProviderChart({ data }: { data: Record<string, ProviderAnalytics> }) {
  if (!data || Object.keys(data).length === 0) return <EmptyChart message="No provider data available" />;
  
  const chartData = Object.entries(data).map(([name, stats]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: stats.messages
  }));

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">AI Providers</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
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
              contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ChannelChart({ data }: { data: Record<string, ChannelAnalytics> }) {
  if (!data || Object.keys(data).length === 0) return <EmptyChart message="No channel data available" />;
  
  const chartData = Object.entries(data).map(([name, stats]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    Generated: stats.generated,
    SuccessRate: stats.success_rate
  }));

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">Channel Performance</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
            <Bar dataKey="Generated" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col items-center justify-center">
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

export function BulkAnalyticsChart({ data }: { data: BulkAnalytics }) {
  if (!data || data.total_jobs === 0) return <EmptyChart message="No bulk jobs available" />;
  
  const chartData = [
    { name: 'Completed', value: data.completed },
    { name: 'Failed', value: data.failed },
    { name: 'Cancelled', value: data.cancelled }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">Bulk Generation Jobs</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Completed' ? 'var(--color-success)' : entry.name === 'Failed' ? 'var(--color-danger)' : 'var(--color-warning)'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ContactFunnelChart({ data }: { data: CampaignAnalytics | null }) {
  if (!data || data.contacts_imported === 0) return <EmptyChart message="Select a campaign with contacts to view funnel" />;
  
  const chartData = [
    { name: 'Imported', value: data.contacts_imported },
    { name: 'Generated', value: data.generated },
    { name: 'Contacted', value: data.contacted },
    { name: 'Interested', value: data.interested },
    { name: 'Enrolled', value: data.enrolled }
  ];

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">Contact Funnel (Top Campaign)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
            <XAxis type="number" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function QualityChart({ data }: { data: any }) {
  if (!data || Object.keys(data).length === 0 || (data.excellent === 0 && data.good === 0 && data.needs_review === 0)) {
    return <EmptyChart message="No quality data available" />;
  }
  
  const chartData = [
    { name: 'Excellent', value: data.excellent || 0, fill: 'var(--color-success)' },
    { name: 'Good', value: data.good || 0, fill: 'var(--color-primary)' },
    { name: 'Needs Review', value: data.needs_review || 0, fill: 'var(--color-warning)' }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">AI Quality Distribution</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${value}%`, 'Percentage']}
              contentStyle={{ backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MostUsedTemplatesList({ templates }: { templates: Array<{id: string, name: string, usage_count: string}> | undefined }) {
  if (!templates || templates.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border shadow-sm h-96 flex flex-col">
        <h3 className="text-lg font-semibold text-foreground mb-6">Most Used Templates</h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-medium">No templates used yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm h-96 overflow-hidden flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">Most Used Templates</h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {templates.map((t, idx) => (
          <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {idx + 1}
              </span>
              <p className="font-medium text-foreground truncate max-w-[150px] sm:max-w-[200px]">{t.name}</p>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {t.usage_count} uses
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
