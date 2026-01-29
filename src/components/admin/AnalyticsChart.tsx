'use client';

import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar
} from 'recharts';
import styles from './AnalyticsChart.module.css';

interface DataItem {
    name: string;
    [key: string]: string | number;
}

interface ChartProps {
    title: string;
    data: DataItem[];
    type?: 'area' | 'bar';
    dataKey: string;
    color?: string;
}

interface TooltipPayload {
    value: number;
    payload: DataItem;
    dataKey: string;
    name: string;
    color: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: TooltipPayload[], label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                <p className={styles.tooltipValue}>{`${payload[0].value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

export const AnalyticsChart: React.FC<ChartProps> = ({
    title,
    data,
    type = 'area',
    dataKey,
    color = '#2F5E4E'
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
            </div>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'area' ? (
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#86868B' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#86868B' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorArea)"
                                animationDuration={1000}
                            />
                        </AreaChart>
                    ) : (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#86868B' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#86868B' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                            <Bar
                                dataKey={dataKey}
                                fill={color}
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                                animationDuration={1000}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
