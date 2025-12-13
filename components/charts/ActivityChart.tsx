import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { DailyActivity, UserStat } from '../../types';

interface ActivityChartProps {
  data: DailyActivity[];
  topUsers: UserStat[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data, topUsers }) => {
  // Subsample data if too large to render performantly
  const chartData = data.length > 200 
    ? data.filter((_, i) => i % Math.ceil(data.length / 200) === 0) 
    : data;

  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#71717a', fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.toLocaleString('default', { month: 'short' })}`
            }}
          />
          <YAxis 
            tick={{ fill: '#71717a', fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ color: '#a1a1aa', marginBottom: '0.25rem', fontSize: '12px' }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          
          {/* Stacked Areas for Top Users */}
          {topUsers.map((user) => (
            <Area 
              key={user.name}
              type="monotone" 
              dataKey={user.name}
              stackId="1" 
              stroke={user.color}
              strokeWidth={0}
              fill={user.color}
              fillOpacity={0.8}
            />
          ))}

          {/* Fallback layer for 'Others' if active */}
          <Area
            type="monotone"
            dataKey="Others"
            stackId="1"
            stroke="#52525b"
            strokeWidth={0}
            fill="#52525b"
            fillOpacity={0.5}
            name="Others"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;