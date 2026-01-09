"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Eye, Trash2, MapPin, Clock } from "lucide-react";
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

interface Event {
  id: string;
  title: string;
  organizer: string;
  category: string;
  date: string;
  location: string;
  attendees: number;
  status: "pending" | "approved" | "rejected" | "published";
  createdAt: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Music Festival 2025",
    organizer: "John Doe",
    category: "Music",
    date: "2025-07-15",
    location: "Central Park, NY",
    attendees: 1250,
    status: "published",
    createdAt: "2025-01-08",
  },
  {
    id: "2",
    title: "Tech Conference 2025",
    organizer: "Mike Johnson",
    category: "Technology",
    date: "2025-03-20",
    location: "Convention Center, SF",
    attendees: 850,
    status: "approved",
    createdAt: "2025-01-07",
  },
  {
    id: "3",
    title: "Art Exhibition: Modern Masters",
    organizer: "Jane Smith",
    category: "Art & Culture",
    date: "2025-02-10",
    location: "City Gallery, Chicago",
    attendees: 320,
    status: "pending",
    createdAt: "2025-01-09",
  },
  {
    id: "4",
    title: "Startup Pitch Night",
    organizer: "Mike Johnson",
    category: "Business",
    date: "2025-02-28",
    location: "Tech Hub, Austin",
    attendees: 150,
    status: "pending",
    createdAt: "2025-01-09",
  },
  {
    id: "5",
    title: "Inappropriate Content Event",
    organizer: "Spam User",
    category: "Other",
    date: "2025-02-01",
    location: "Unknown",
    attendees: 0,
    status: "rejected",
    createdAt: "2025-01-06",
  },
];

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "published">("all");

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApproveEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, status: "approved" as const } : event
      )
    );
  };

  const handleRejectEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, status: "rejected" as const } : event
      )
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Published</Badge>;
      case "approved":
        return <Badge className="bg-blue-500 text-white">Approved</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  const pendingCount = events.filter((e) => e.status === "pending").length;
  const approvedCount = events.filter((e) => e.status === "approved").length;
  const publishedCount = events.filter((e) => e.status === "published").length;
  const rejectedCount = events.filter((e) => e.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-2">
            Manage and moderate platform events
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Events</CardTitle>
              <CardDescription>{filteredEvents.length} events found</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title or organizer..."
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
                  <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("approved")}>
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("published")}>
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("rejected")}>
                    Rejected
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
                  <TableHead>Event</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{event.title}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{event.organizer}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{event.attendees.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {event.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleApproveEvent(event.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve Event
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectEvent(event.id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject Event
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Eye className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No events found</p>
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
