"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Ban, Shield, Mail, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "organizer";
  status: "active" | "suspended" | "banned";
  eventsCreated: number;
  joinedDate: string;
  lastActive: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "organizer",
    status: "active",
    eventsCreated: 5,
    joinedDate: "2024-11-15",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "user",
    status: "active",
    eventsCreated: 0,
    joinedDate: "2024-12-01",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    role: "organizer",
    status: "active",
    eventsCreated: 12,
    joinedDate: "2024-10-20",
    lastActive: "5 minutes ago",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    role: "user",
    status: "suspended",
    eventsCreated: 0,
    joinedDate: "2024-12-10",
    lastActive: "3 days ago",
  },
  {
    id: "5",
    name: "Tom Brown",
    email: "spam.user@example.com",
    role: "user",
    status: "banned",
    eventsCreated: 0,
    joinedDate: "2025-01-05",
    lastActive: "1 week ago",
  },
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended" | "banned">("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSuspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "suspended" as const } : user
      )
    );
  };

  const handleActivateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "active" as const } : user
      )
    );
  };

  const handleBanUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "banned" as const } : user
      )
    );
  };

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success" className="capitalize">Active</Badge>;
      case "suspended":
        return <Badge variant="warning" className="capitalize">Suspended</Badge>;
      case "banned":
        return <Badge variant="destructive" className="capitalize">Banned</Badge>;
    }
  };

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const bannedCount = users.filter((u) => u.status === "banned").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform users and their permissions
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{suspendedCount}</p>
            <p className="text-xs text-muted-foreground">Suspended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{bannedCount}</p>
            <p className="text-xs text-muted-foreground">Banned</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>{filteredUsers.length} users found</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter: {filterStatus === "all" ? "All" : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("suspended")}>
                    Suspended
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("banned")}>
                    Banned
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <span className="font-medium">{user.eventsCreated}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.joinedDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {user.lastActive}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => handleSuspendUser(user.id)}
                                className="text-yellow-600"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            )}
                            {user.status === "suspended" && (
                              <DropdownMenuItem
                                onClick={() => handleActivateUser(user.id)}
                                className="text-green-600"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                            {user.status !== "banned" && (
                              <DropdownMenuItem
                                onClick={() => handleBanUser(user.id)}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
