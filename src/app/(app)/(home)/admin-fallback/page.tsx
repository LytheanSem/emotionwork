"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCategories, mockEquipment } from "@/lib/mock-data";

export default function AdminFallbackPage() {
  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600 mb-4">
          Database connection is currently unavailable. This is a read-only view
          of your data structure.
        </p>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            ⚠️ Database connection failed. You cannot add/edit equipment until
            the connection is restored.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Categories ({mockCategories.length})
              <Button variant="outline" size="sm" disabled>
                Add Category
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Equipment ({mockEquipment.length})
              <Button variant="outline" size="sm" disabled>
                Add Equipment
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockEquipment.map((equipment) => (
                <div
                  key={equipment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{equipment.name}</p>
                    <p className="text-sm text-gray-600">
                      {equipment.brand} • Qty: {equipment.quantity}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          How to Fix Database Connection
        </h3>
        <div className="space-y-2 text-blue-800 text-sm">
          <p>
            1. <strong>Check your .env.local file</strong> - Make sure
            DATABASE_URI is correct
          </p>
          <p>
            2. <strong>Verify IP whitelist</strong> - Your current IP might not
            be whitelisted in MongoDB Atlas
          </p>
          <p>
            3. <strong>Use local MongoDB</strong> - Run the setup script:{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              chmod +x setup-local-mongodb.sh && ./setup-local-mongodb.sh
            </code>
          </p>
          <p>
            4. <strong>Check network</strong> - Ensure your network allows
            MongoDB connections
          </p>
        </div>
      </div>
    </div>
  );
}
