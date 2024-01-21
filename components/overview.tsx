"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"

interface OverviewProps {
    data: any[]
}

export const Overview: React.FC<OverviewProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
            <YAxis yAxisId="left" orientation="left" stroke="#3498db" fontSize={12} tickLine={false} axisLine={false}/>
            <YAxis yAxisId="right" orientation="right" stroke="#2dd4bf" fontSize={12} tickLine={false} axisLine={false}/>
            <Tooltip  cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
            <Bar yAxisId="left" dataKey="Quotes" fill="#3498db" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="Items" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
  )
}
export default Overview