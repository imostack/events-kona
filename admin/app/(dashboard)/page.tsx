"use client";

import { Users, Calendar, TrendingUp, DollarSign, Activity, UserPlus, CalendarPlus, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    title: "Active Events",
    value: "487",
    change: "+8.2%",
    trend: "up" as const,
    icon: Calendar,
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/20",
  },
  {
    title: "Event Views",
    value: "45.2K",
    change: "+23.1%",
    trend: "up" as const,
    icon: TrendingUp,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    title: "Revenue",
    value: "$12,345",
    change: "+15.3%",
    trend: "up" as const,
    icon: DollarSign,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
  },
];

const chartData = [
  { name: "Jan", users: 1200, events: 240, revenue: 4800 },
  { name: "Feb", users: 1400, events: 290, revenue: 5600 },
  { name: "Mar", users: 1800, events: 350, revenue: 7200 },
  { name: "Apr", users: 2100, events: 420, revenue: 9400 },
  { name: "May", users: 2300, events: 450, revenue: 11200 },
  { name: "Jun", users: 2543, events: 487, revenue: 12345 },
];

const recentActivity = [
  {
    id: 1,
    type: "user_signup",
    message: "New user registered",
    detail: "john.doe@example.com",
    timestamp: "2 minutes ago",
    icon: UserPlus,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    id: 2,
    type: "event_created",
    message: "New event created",
    detail: "Summer Music Festival 2025",
    timestamp: "15 minutes ago",
    icon: CalendarPlus,
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/20",
  },
  {
    id: 3,
    type: "event_approved",
    message: "Event approved",
    detail: "Tech Conference 2025",
    timestamp: "1 hour ago",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  {
    id: 4,
    type: "user_banned",
    message: "User suspended",
    detail: "spam.user@example.com",
    timestamp: "2 hours ago",
    icon: AlertCircle,
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    id: 5,
    type: "event_rejected",
    message: "Event rejected",
    detail: "Inappropriate Content Event",
    timestamp: "3 hours ago",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900/20",
  },
];

const quickActions = [
  {
    title: "Review Pending Events",
    description: "12 events awaiting approval",
    icon: Clock,
    href: "/events?status=pending",
    variant: "default" as const,
    badge: "12",
  },
  {
    title: "Manage Reported Users",
    description: "5 reports to review",
    icon: AlertCircle,
    href: "/users?status=reported",
    variant: "secondary" as const,
    badge: "5",
  },
  {
    title: "View Analytics",
    description: "Weekly platform insights",
    icon: Activity,
    href: "/analytics",
    variant: "outline" as const,
  },
];

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {admin?.name}! Here's what's happening today.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total registered users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(262, 83%, 58%)"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events & Revenue</CardTitle>
            <CardDescription>Monthly performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="events" fill="hsl(142, 76%, 36%)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" fill="hsl(48, 96%, 53%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${activity.bg} shrink-0`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.detail}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant={action.variant}
                  className="w-full justify-start h-auto p-4"
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {action.description}
                        </p>
                      </div>
                      {action.badge && (
                        <Badge variant="secondary">{action.badge}</Badge>
                      )}
                    </div>
                  </a>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Super Admin Section */}
      {admin?.role === "super_admin" && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Super Admin Tools</CardTitle>
                <CardDescription>
                  Full administrative privileges - use with caution
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button size="lg" className="shadow-lg">
                Manage Admins
              </Button>
              <Button variant="outline" size="lg">
                Platform Settings
              </Button>
              <Button variant="ghost" size="lg">
                System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
