"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Save } from "lucide-react";

// Mock data - Replace with API calls
const mockCategories = [
  { id: "music", name: "Music", icon: "Music", color: "#8b5cf6", eventsCount: 45 },
  { id: "business", name: "Business", icon: "Briefcase", color: "#3b82f6", eventsCount: 32 },
  { id: "food", name: "Food & Drink", icon: "Utensils", color: "#f97316", eventsCount: 28 },
  { id: "arts", name: "Arts", icon: "Palette", color: "#ec4899", eventsCount: 19 },
  { id: "sports", name: "Sports", icon: "Trophy", color: "#10b981", eventsCount: 24 },
  { id: "tech", name: "Technology", icon: "Cpu", color: "#06b6d4", eventsCount: 38 },
  { id: "education", name: "Education", icon: "GraduationCap", color: "#f59e0b", eventsCount: 15 },
  { id: "religious", name: "Religious", icon: "Calendar", color: "#f43f5e", eventsCount: 12 },
];

const mockCurrencies = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", enabled: true, eventsCount: 487 },
  { code: "USD", name: "US Dollar", symbol: "$", enabled: true, eventsCount: 125 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", enabled: true, eventsCount: 78 },
  { code: "EUR", name: "Euro", symbol: "€", enabled: false, eventsCount: 0 },
  { code: "GBP", name: "British Pound", symbol: "£", enabled: false, eventsCount: 0 },
];

const mockValidationRules = {
  eventTitle: { minLength: 5, maxLength: 100 },
  eventDescription: { minLength: 20, maxLength: 2000 },
  ticketPrice: { min: 0, max: 10000000 },
  eventCapacity: { min: 1, max: 100000 },
};

export default function SettingsPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [currencies, setCurrencies] = useState(mockCurrencies);
  const [validationRules, setValidationRules] = useState(mockValidationRules);

  const handleAddCategory = () => {
    // TODO: Open modal/form to add new category
    alert("Add Category - Connect to API: POST /api/admin/settings/categories");
  };

  const handleEditCategory = (id: string) => {
    // TODO: Open modal/form to edit category
    alert(`Edit Category ${id} - Connect to API: PUT /api/admin/settings/categories/${id}`);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will affect all events using it.")) {
      // TODO: Call API to delete category
      alert(`Delete Category ${id} - Connect to API: DELETE /api/admin/settings/categories/${id}`);
    }
  };

  const handleToggleCurrency = (code: string) => {
    setCurrencies(currencies.map(curr =>
      curr.code === code ? { ...curr, enabled: !curr.enabled } : curr
    ));
    // TODO: Call API to update currency
    alert(`Toggle Currency ${code} - Connect to API: PUT /api/admin/settings/currencies/${code}`);
  };

  const handleSaveValidationRules = () => {
    // TODO: Call API to save validation rules
    alert("Save Validation Rules - Connect to API: PUT /api/admin/settings/validation-rules");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage platform configuration, categories, currencies, and validation rules
        </p>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Categories</CardTitle>
              <CardDescription>
                Manage event categories available across the platform
              </CardDescription>
            </div>
            <Button onClick={handleAddCategory} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Active Events</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.icon}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-500">{category.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.eventsCount} events</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Currencies Section */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Currencies</CardTitle>
          <CardDescription>
            Enable or disable currencies for event pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Active Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell>{currency.code}</TableCell>
                  <TableCell className="text-lg">{currency.symbol}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{currency.eventsCount} events</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={currency.enabled ? "default" : "secondary"}>
                      {currency.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={currency.enabled ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleCurrency(currency.code)}
                    >
                      {currency.enabled ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validation Rules Section */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Rules</CardTitle>
          <CardDescription>
            Configure validation constraints for event creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Title</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Minimum Length</label>
                  <Input
                    type="number"
                    value={validationRules.eventTitle.minLength}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        eventTitle: {
                          ...validationRules.eventTitle,
                          minLength: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Maximum Length</label>
                  <Input
                    type="number"
                    value={validationRules.eventTitle.maxLength}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        eventTitle: {
                          ...validationRules.eventTitle,
                          maxLength: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Description</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Minimum Length</label>
                  <Input
                    type="number"
                    value={validationRules.eventDescription.minLength}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        eventDescription: {
                          ...validationRules.eventDescription,
                          minLength: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Maximum Length</label>
                  <Input
                    type="number"
                    value={validationRules.eventDescription.maxLength}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        eventDescription: {
                          ...validationRules.eventDescription,
                          maxLength: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Ticket Price */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Ticket Price (NGN)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Minimum Price</label>
                  <Input
                    type="number"
                    value={validationRules.ticketPrice.min}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        ticketPrice: {
                          ...validationRules.ticketPrice,
                          min: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Maximum Price</label>
                  <Input
                    type="number"
                    value={validationRules.ticketPrice.max}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        ticketPrice: {
                          ...validationRules.ticketPrice,
                          max: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Event Capacity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Capacity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Minimum Capacity</label>
                  <Input
                    type="number"
                    value={validationRules.eventCapacity.min}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        eventCapacity: {
                          ...validationRules.eventCapacity,
                          min: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Maximum Capacity</label>
                  <Input
                    type="number"
                    value={validationRules.eventCapacity.max}
                    onChange={(e) =>
                      setValidationRules({
                        ...validationRules,
                        eventCapacity: {
                          ...validationRules.eventCapacity,
                          max: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveValidationRules} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Validation Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
