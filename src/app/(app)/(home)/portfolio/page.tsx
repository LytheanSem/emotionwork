"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Stage {
  id: string;
  name: string;
  type?: string;
  status: "indoor" | "outdoor";
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  imageUrl?: string;
  description?: string;
}

export default function PortfolioPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      const response = await fetch("/api/stages");
      const data = await response.json();
      setStages(data.stages || []);
    } catch (error) {
      console.error("Error loading stages:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "indoor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "outdoor":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStage(null);
  };

  const filteredStages = stages.filter((stage) => {
    if (statusFilter === "all") return true;
    return stage.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 pb-32">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PRODUCT
          </h1>
          <p className="text-lg text-gray-600">
            Explore our collection of stages.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-8">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-64 border border-gray-300">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="indoor">Indoor</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stages Grid - Fixed 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStages.map((stage) => (
            <Card 
              key={stage.id} 
              className="border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleStageClick(stage)}
            >
              <CardContent className="p-0">
                {/* Image Placeholder - Bigger size */}
                <div className="relative w-full h-80 bg-gray-200 flex items-center justify-center">
                  {stage.imageUrl ? (
                    <Image
                      src={stage.imageUrl}
                      alt={stage.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-gray-400 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl font-bold">×</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Stage Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {stage.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(stage.status)} border rounded-full px-3 py-1 text-sm`}
                  >
                    {stage.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No stages found.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedStage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStage.name}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Stage Image */}
                <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden mb-6">
                  {selectedStage.imageUrl ? (
                    <Image
                      src={selectedStage.imageUrl}
                      alt={selectedStage.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 border-2 border-gray-400 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl font-bold">×</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(selectedStage.status)} border rounded-full px-4 py-2 text-base`}
                    >
                      {selectedStage.status}
                    </Badge>
                    {selectedStage.category && (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200 border rounded-full px-4 py-2 text-base">
                        {selectedStage.category.name}
                      </Badge>
                    )}
                  </div>

                  {selectedStage.type && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Type</h3>
                      <p className="text-gray-600">{selectedStage.type}</p>
                    </div>
                  )}

                  {selectedStage.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedStage.description}</p>
                    </div>
                  )}

                  {selectedStage.category?.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Details</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedStage.category.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
