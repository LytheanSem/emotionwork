"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import EquipmentMediaUpload from "@/components/equipment-media-upload";

interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "manager" | "admin";
  image?: string;
  provider: string;
  createdAt: string;
  collection?: "adminUsers" | "managerUsers" | "regularUsers";
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Equipment {
  id: string;
  name: string;
  brand?: string;
  status: "available" | "in_use" | "maintenance";
  quantity: number;
  category?: Category;
  categoryId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  imageResourceType?: string;
  description?: string;
  length?: number; // Length in meters
  price?: number; // Price in USD
}

interface Stage {
  id: string;
  name: string;
  type?: string;
  status: "indoor" | "outdoor";
  category?: Category;
  categoryId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  imageResourceType?: string;
  description?: string;
}

export default function AdminPanel() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Role-based access control
  const isAdmin = session?.user?.isAdmin || false;
  const isManager = session?.user?.isManager || false;
  const canManageUsers = isAdmin; // Only admins can manage users
  const canManageContent = isAdmin || isManager; // Both admins and managers can manage content
  

  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipmentCategories, setEquipmentCategories] = useState<Category[]>([]);
  const [stageCategories, setStageCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState(() => {
    // Set default tab based on user role
    if (session?.user?.isAdmin) {
      return "users";
    } else if (session?.user?.isManager) {
      return "categories"; // Managers start with categories tab
    }
    return "categories"; // Fallback to categories
  });

  // Modal states
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "user" as "user" | "manager" | "admin",
  });
  const [showCreateEquipment, setShowCreateEquipment] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    brand: "",
    status: "available" as "available" | "in_use" | "maintenance",
    quantity: 1,
    categoryId: "",
    imageUrl: "",
    imagePublicId: "",
    imageResourceType: "image",
    description: "",
    length: undefined as number | undefined,
    price: undefined as number | undefined,
  });
  const [showCreateStage, setShowCreateStage] = useState(false);
  const [newStage, setNewStage] = useState({
    name: "",
    type: "",
    status: "indoor" as "indoor" | "outdoor",
    categoryId: "",
    imageUrl: "",
    imagePublicId: "",
    imageResourceType: "image",
    description: "",
  });

  // Edit modal states
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditEquipment, setShowEditEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showEditStage, setShowEditStage] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  // Memoized filtered data for performance
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const filteredEquipment = useMemo(() => {
    if (!searchTerm) return equipment;
    return equipment.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [equipment, searchTerm]);

  const filteredStages = useMemo(() => {
    if (!searchTerm) return stages;
    return stages.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stages, searchTerm]);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);

      // Load users (only for admins)
      if (canManageUsers) {
        const usersResponse = await fetch("/api/admin/users");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users || []);
        }
      } else {
        // Clear users if user can't manage them
        setUsers([]);
      }

      // Load all categories
      const categoriesResponse = await fetch("/api/admin/categories");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

      // Load equipment categories
      const equipmentCategoriesResponse = await fetch("/api/equipment-categories");
      if (equipmentCategoriesResponse.ok) {
        const equipmentCategoriesData = await equipmentCategoriesResponse.json();
        setEquipmentCategories(equipmentCategoriesData.categories || []);
      }

      // Load stage categories
      const stageCategoriesResponse = await fetch("/api/stage-categories");
      if (stageCategoriesResponse.ok) {
        const stageCategoriesData = await stageCategoriesResponse.json();
        setStageCategories(stageCategoriesData.categories || []);
      }

      // Load equipment
      const equipmentResponse = await fetch("/api/admin/equipment");
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        setEquipment(equipmentData.equipment || []);
      }

      // Load stages
      const stagesResponse = await fetch("/api/admin/stages");
      if (stagesResponse.ok) {
        const stagesData = await stagesResponse.json();
        setStages(stagesData.stages || []);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [canManageUsers]);

  // CRUD Functions
  const createCategory = async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        toast.success("Category created successfully");
        setShowCreateCategory(false);
        setNewCategory({ name: "", description: "" });
        loadAdminData();
      } else {
        toast.error("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      if (response.ok) {
        toast.success("Category updated successfully");
        setShowEditCategory(false);
        setEditingCategory(null);
        loadAdminData();
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully");
        loadAdminData();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast.success("User created successfully");
        setShowCreateUser(false);
        setNewUser({ username: "", email: "", role: "user" });
        loadAdminData();
      } else {
        toast.error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      if (response.ok) {
        toast.success("User updated successfully");
        setShowEditUser(false);
        setEditingUser(null);
        loadAdminData();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        loadAdminData();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const createEquipment = async () => {
    try {
      const response = await fetch("/api/admin/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEquipment),
      });

      if (response.ok) {
        toast.success("Equipment created successfully");
        setShowCreateEquipment(false);
        setNewEquipment({
          name: "",
          brand: "",
          status: "available",
          quantity: 1,
          categoryId: "",
          imageUrl: "",
          imagePublicId: "",
          imageResourceType: "image",
          description: "",
          length: undefined,
          price: undefined,
        });
        loadAdminData();
      } else {
        toast.error("Failed to create equipment");
      }
    } catch (error) {
      console.error("Error creating equipment:", error);
      toast.error("Failed to create equipment");
    }
  };

  const updateEquipment = async () => {
    if (!editingEquipment) return;

    try {
      const response = await fetch(`/api/admin/equipment/${editingEquipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEquipment),
      });

      if (response.ok) {
        toast.success("Equipment updated successfully");
        setShowEditEquipment(false);
        setEditingEquipment(null);
        loadAdminData();
      } else {
        toast.error("Failed to update equipment");
      }
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast.error("Failed to update equipment");
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const response = await fetch(`/api/admin/equipment/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Equipment deleted successfully");
        loadAdminData();
      } else {
        toast.error("Failed to delete equipment");
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment");
    }
  };

  const createStage = async () => {
    try {
      const response = await fetch("/api/admin/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStage),
      });

      if (response.ok) {
        toast.success("Stage created successfully");
        setShowCreateStage(false);
        setNewStage({
          name: "",
          type: "",
          status: "indoor",
          categoryId: "",
          imageUrl: "",
          imagePublicId: "",
          imageResourceType: "image",
          description: "",
        });
        loadAdminData();
      } else {
        toast.error("Failed to create stage");
      }
    } catch (error) {
      console.error("Error creating stage:", error);
      toast.error("Failed to create stage");
    }
  };

  const updateStage = async () => {
    if (!editingStage) return;

    try {
      const response = await fetch(`/api/admin/stages/${editingStage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStage),
      });

      if (response.ok) {
        toast.success("Stage updated successfully");
        setShowEditStage(false);
        setEditingStage(null);
        loadAdminData();
      } else {
        toast.error("Failed to update stage");
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Failed to update stage");
    }
  };

  const deleteStage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stage?")) return;

    try {
      const response = await fetch(`/api/admin/stages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Stage deleted successfully");
        loadAdminData();
      } else {
        toast.error("Failed to delete stage");
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast.error("Failed to delete stage");
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (!session.user.isAdmin && !session.user.isManager)) {
      toast.error("Access denied. Admin or Manager privileges required.");
      router.push("/");
      return;
    }

    loadAdminData();
  }, [session, status, router, loadAdminData]);

  // Update currentTab when session changes
  useEffect(() => {
    if (session?.user) {
      if (session.user.isAdmin) {
        setCurrentTab("users");
      } else if (session.user.isManager) {
        setCurrentTab("categories");
      }
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show loading while session is being fetched
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check access only after session is loaded
  if (!session?.user.isAdmin && !session?.user.isManager) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You need admin or manager privileges to access this page.
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
            <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {isAdmin ? "Admin Panel" : "Manager Panel"}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {isAdmin 
                  ? "Manage your application's users, categories, equipment, and stages"
                  : "Manage your application's categories, equipment, and stages"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-6 mb-8 ${canManageUsers ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-4'}`}>
          {canManageUsers && (
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                <p className="text-xs text-gray-500 mt-1">Active accounts</p>
              </CardContent>
            </Card>
          )}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{categories.length}</div>
              <p className="text-xs text-gray-500 mt-1">Organized items</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Equipment</CardTitle>
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{equipment.length}</div>
              <p className="text-xs text-gray-500 mt-1">Available items</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stages</CardTitle>
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stages.length}</div>
              <p className="text-xs text-gray-500 mt-1">Venues available</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => router.push("/admin/stage-bookings")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stage Bookings</CardTitle>
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">Manage</div>
              <p className="text-xs text-gray-500 mt-1">View bookings</p>
            </CardContent>
          </Card>
        </div>



        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              placeholder={canManageUsers 
                ? "Search users, categories, equipment, or stages..."
                : "Search categories, equipment, or stages..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          value={currentTab} 
          onValueChange={(value) => {
            // Ensure managers can't access the users tab
            if (value === "users" && !canManageUsers) {
              setCurrentTab("categories");
            } else {
              setCurrentTab(value);
            }
          }} 
          className="space-y-6"
        >
          <TabsList className={`grid w-full ${canManageUsers ? 'grid-cols-4' : 'grid-cols-3'} bg-muted p-1 rounded-lg`}>
            {canManageUsers && (
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Users
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="categories"
              className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="equipment"
              className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Equipment
            </TabsTrigger>
            <TabsTrigger 
              value="stages"
              className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Stages
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          {canManageUsers && (
            <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
              </div>
              {canManageUsers && (
                <Button onClick={() => setShowCreateUser(true)} className="bg-blue-600 hover:bg-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add User
                </Button>
              )}
            </div>
            
            {/* Users Grid - Organized by Role */}
            <div className="space-y-8">
              {/* Admin Users Section */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Administrators</h3>
                  <Badge variant="default" className="bg-red-100 text-red-800 border-red-200">
                    {filteredUsers.filter(user => user.role === "admin").length} users
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {filteredUsers
                    .filter(user => user.role === "admin")
                    .map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-red-500">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            {/* User Info */}
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
                                {user.image ? (
                                  <Image
                                    src={user.image}
                                    alt={user.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-semibold text-lg">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                  </svg>
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant="default"
                                className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 border-red-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                Admin
                              </Badge>
                              
                              {canManageUsers && (
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingUser(user);
                                      setShowEditUser(true);
                                    }}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Manager Users Section */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Managers</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    {filteredUsers.filter(user => user.role === "manager").length} users
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {filteredUsers
                    .filter(user => user.role === "manager")
                    .map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            {/* User Info */}
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                                {user.image ? (
                                  <Image
                                    src={user.image}
                                    alt={user.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-semibold text-lg">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                  </svg>
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant="default"
                                className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 border-blue-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Manager
                              </Badge>
                              
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowEditUser(true);
                                  }}
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Regular Users Section */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Regular Users</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {filteredUsers.filter(user => user.role === "user").length} users
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {filteredUsers
                    .filter(user => user.role === "user")
                    .map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            {/* User Info */}
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-md">
                                {user.image ? (
                                  <Image
                                    src={user.image}
                                    alt={user.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-semibold text-lg">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                  </svg>
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant="secondary"
                                className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 border-green-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                                User
                              </Badge>
                              
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowEditUser(true);
                                  }}
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
            
            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Try adjusting your search criteria" : "Get started by creating your first user"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateUser(true)}>
                    Create First User
                  </Button>
                )}
              </div>
            )}

            {/* Empty States for Individual Sections */}
            {filteredUsers.length > 0 && (
              <>
                {/* Empty Admin Section */}
                {filteredUsers.filter(user => user.role === "admin").length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 mb-3">
                      <svg className="mx-auto h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No administrators</h4>
                    <p className="text-xs text-gray-500">No admin users found</p>
                  </div>
                )}

                {/* Empty Regular Users Section */}
                {filteredUsers.filter(user => user.role === "user").length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 mb-3">
                      <svg className="mx-auto h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">No regular users</h4>
                    <p className="text-xs text-gray-500">No regular users found</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          )}

          {/* Categories Tab */}
          {canManageContent && (
            <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Category Management</h2>
              {canManageContent && (
                <Button onClick={() => setShowCreateCategory(true)}>Add Category</Button>
              )}
            </div>
            <div className="grid gap-4">
              {filteredCategories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {canManageContent && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setShowEditCategory(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteCategory(category.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          )}

          {/* Equipment Tab */}
          {canManageContent && (
            <TabsContent value="equipment" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Equipment Management</h2>
              <div className="flex space-x-2">
                {canManageContent && (
                  <Button onClick={() => setShowCreateEquipment(true)}>Add Equipment</Button>
                )}
                <Button variant="outline" onClick={() => router.push("/equipment")}>
                  View Equipment
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {filteredEquipment.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.imageUrl && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.brand && `${item.brand} • `}
                            {item.category?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            item.status === "available"
                              ? "default"
                              : item.status === "in_use"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                        {canManageContent && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingEquipment(item);
                                setShowEditEquipment(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteEquipment(item.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          )}

          {/* Stages Tab */}
          {canManageContent && (
            <TabsContent value="stages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Stage Management</h2>
              <div className="flex space-x-2">
                {canManageContent && (
                  <Button onClick={() => setShowCreateStage(true)}>Add Stage</Button>
                )}
                <Button variant="outline" onClick={() => router.push("/portfolio")}>
                  View Portfolio
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {filteredStages.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.imageUrl && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.type && `${item.type} • `}
                            {item.category?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={item.status === "indoor" ? "default" : "secondary"}
                        >
                          {item.status}
                        </Badge>
                        {canManageContent && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingStage(item);
                                setShowEditStage(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteStage(item.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          )}
        </Tabs>

        {/* Create Category Modal */}
        {canManageContent && (
          <Modal 
            isOpen={showCreateCategory} 
            onClose={() => setShowCreateCategory(false)}
            title="Create Category"
          >
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateCategory(false)}>
                Cancel
              </Button>
              <Button onClick={createCategory}>Create</Button>
            </div>
          </div>
        </Modal>
        )}

        {/* Edit Category Modal */}
        {canManageContent && (
          <Modal 
            isOpen={showEditCategory} 
            onClose={() => setShowEditCategory(false)}
            title="Edit Category"
          >
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCategoryName">Name</Label>
                <Input
                  id="editCategoryName"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editCategoryDescription">Description</Label>
                <Textarea
                  id="editCategoryDescription"
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditCategory(false)}>
                  Cancel
                </Button>
                <Button onClick={updateCategory}>Update</Button>
              </div>
            </div>
          )}
        </Modal>
        )}

        {/* Create User Modal */}
        {canManageUsers && (
          <Modal 
            isOpen={showCreateUser} 
            onClose={() => setShowCreateUser(false)}
            title="Create User"
          >
          <div className="space-y-4">
            <div>
              <Label htmlFor="userUsername">Username</Label>
              <Input
                id="userUsername"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="userRole">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "user" | "admin") =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
              <Button onClick={createUser}>Create</Button>
            </div>
          </div>
        </Modal>
        )}

        {/* Edit User Modal */}
        {canManageUsers && (
          <Modal 
            isOpen={showEditUser} 
            onClose={() => setShowEditUser(false)}
            title="Edit User"
          >
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editUserUsername">Username</Label>
                <Input
                  id="editUserUsername"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editUserEmail">Email</Label>
                <Input
                  id="editUserEmail"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editUserRole">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: "user" | "manager" | "admin") =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditUser(false)}>
                  Cancel
                </Button>
                <Button onClick={updateUser}>Update</Button>
              </div>
            </div>
          )}
        </Modal>
        )}

        {/* Create Equipment Modal */}
        {canManageContent && (
          <Modal 
            isOpen={showCreateEquipment} 
            onClose={() => setShowCreateEquipment(false)}
            title="Create Equipment"
          >
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipmentName">Name</Label>
              <Input
                id="equipmentName"
                value={newEquipment.name}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="equipmentBrand">Brand</Label>
              <Input
                id="equipmentBrand"
                value={newEquipment.brand}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, brand: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="equipmentStatus">Status</Label>
              <Select
                value={newEquipment.status}
                onValueChange={(value: "available" | "in_use" | "maintenance") =>
                  setNewEquipment({ ...newEquipment, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="equipmentQuantity">Quantity</Label>
              <Input
                id="equipmentQuantity"
                type="number"
                min="1"
                value={newEquipment.quantity}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="equipmentCategory">Category</Label>
              <Select
                value={newEquipment.categoryId}
                onValueChange={(value) =>
                  setNewEquipment({ ...newEquipment, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image</Label>
              <EquipmentMediaUpload
                onUploadComplete={(result) => {
                  setNewEquipment({
                    ...newEquipment,
                    imageUrl: result.secure_url,
                    imagePublicId: result.public_id,
                    imageResourceType: result.resource_type,
                  });
                }}
                onUploadError={(error) => toast.error(error)}
                onRemove={() => {
                  setNewEquipment({
                    ...newEquipment,
                    imageUrl: "",
                    imagePublicId: "",
                    imageResourceType: "image",
                  });
                }}
                currentMedia={newEquipment.imageUrl ? {
                  url: newEquipment.imageUrl,
                  public_id: newEquipment.imagePublicId || "",
                  resource_type: newEquipment.imageResourceType as "image" | "video" || "image"
                } : undefined}
              />
            </div>
            <div>
              <Label htmlFor="equipmentDescription">Description</Label>
              <Textarea
                id="equipmentDescription"
                value={newEquipment.description}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipmentLength">Length (meters)</Label>
                <Input
                  id="equipmentLength"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 2.5"
                  value={newEquipment.length || ""}
                  onChange={(e) =>
                    setNewEquipment({ 
                      ...newEquipment, 
                      length: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="equipmentPrice">Price (USD)</Label>
                <Input
                  id="equipmentPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 1500.00"
                  value={newEquipment.price || ""}
                  onChange={(e) =>
                    setNewEquipment({ 
                      ...newEquipment, 
                      price: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateEquipment(false)}>
                Cancel
              </Button>
              <Button onClick={createEquipment}>Create</Button>
            </div>
          </div>
        </Modal>
        )}

        {/* Edit Equipment Modal */}
        {canManageContent && (
          <Modal 
            isOpen={showEditEquipment} 
            onClose={() => setShowEditEquipment(false)}
            title="Edit Equipment"
          >
          {editingEquipment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editEquipmentName">Name</Label>
                <Input
                  id="editEquipmentName"
                  value={editingEquipment.name}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editEquipmentBrand">Brand</Label>
                <Input
                  id="editEquipmentBrand"
                  value={editingEquipment.brand || ""}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, brand: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editEquipmentStatus">Status</Label>
                <Select
                  value={editingEquipment.status}
                  onValueChange={(value: "available" | "in_use" | "maintenance") =>
                    setEditingEquipment({ ...editingEquipment, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editEquipmentQuantity">Quantity</Label>
                <Input
                  id="editEquipmentQuantity"
                  type="number"
                  min="1"
                  value={editingEquipment.quantity}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, quantity: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editEquipmentCategory">Category</Label>
                <Select
                  value={editingEquipment.categoryId || ""}
                  onValueChange={(value) =>
                    setEditingEquipment({ ...editingEquipment, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image</Label>
                <EquipmentMediaUpload
                  onUploadComplete={(result) => {
                    setEditingEquipment({
                      ...editingEquipment,
                      imageUrl: result.secure_url,
                      imagePublicId: result.public_id,
                      imageResourceType: result.resource_type,
                    });
                  }}
                  onUploadError={(error) => toast.error(error)}
                  onRemove={() => {
                    setEditingEquipment({
                      ...editingEquipment,
                      imageUrl: "",
                      imagePublicId: "",
                      imageResourceType: "image",
                    });
                  }}
                  currentMedia={editingEquipment.imageUrl ? {
                    url: editingEquipment.imageUrl,
                    public_id: editingEquipment.imagePublicId || "",
                    resource_type: editingEquipment.imageResourceType as "image" | "video" || "image"
                  } : undefined}
                />
              </div>
              <div>
                <Label htmlFor="editEquipmentDescription">Description</Label>
                <Textarea
                  id="editEquipmentDescription"
                  value={editingEquipment.description || ""}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEquipmentLength">Length (meters)</Label>
                  <Input
                    id="editEquipmentLength"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 2.5"
                    value={editingEquipment.length || ""}
                    onChange={(e) =>
                      setEditingEquipment({ 
                        ...editingEquipment, 
                        length: e.target.value ? parseFloat(e.target.value) : undefined 
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editEquipmentPrice">Price (USD)</Label>
                  <Input
                    id="editEquipmentPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 1500.00"
                    value={editingEquipment.price || ""}
                    onChange={(e) =>
                      setEditingEquipment({ 
                        ...editingEquipment, 
                        price: e.target.value ? parseFloat(e.target.value) : undefined 
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditEquipment(false)}>
                  Cancel
                </Button>
                <Button onClick={updateEquipment}>Update</Button>
              </div>
            </div>
          )}
        </Modal>
        )}

        {/* Create Stage Modal */}
        {canManageContent && (
          <Modal 
            isOpen={showCreateStage} 
            onClose={() => setShowCreateStage(false)}
            title="Create Stage"
          >
          <div className="space-y-4">
            <div>
              <Label htmlFor="stageName">Name</Label>
              <Input
                id="stageName"
                value={newStage.name}
                onChange={(e) =>
                  setNewStage({ ...newStage, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="stageType">Type</Label>
              <Input
                id="stageType"
                value={newStage.type}
                onChange={(e) =>
                  setNewStage({ ...newStage, type: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="stageStatus">Status</Label>
              <Select
                value={newStage.status}
                onValueChange={(value: "indoor" | "outdoor") =>
                  setNewStage({ ...newStage, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stageCategory">Category</Label>
              <Select
                value={newStage.categoryId}
                onValueChange={(value) =>
                  setNewStage({ ...newStage, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {stageCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image</Label>
              <EquipmentMediaUpload
                onUploadComplete={(result) => {
                  setNewStage({
                    ...newStage,
                    imageUrl: result.secure_url,
                    imagePublicId: result.public_id,
                    imageResourceType: result.resource_type,
                  });
                }}
                onUploadError={(error) => toast.error(error)}
                onRemove={() => {
                  setNewStage({
                    ...newStage,
                    imageUrl: "",
                    imagePublicId: "",
                    imageResourceType: "image",
                  });
                }}
                currentMedia={newStage.imageUrl ? {
                  url: newStage.imageUrl,
                  public_id: newStage.imagePublicId || "",
                  resource_type: newStage.imageResourceType as "image" | "video" || "image"
                } : undefined}
              />
            </div>
            <div>
              <Label htmlFor="stageDescription">Description</Label>
              <Textarea
                id="stageDescription"
                value={newStage.description}
                onChange={(e) =>
                  setNewStage({ ...newStage, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateStage(false)}>
                Cancel
              </Button>
              <Button onClick={createStage}>Create</Button>
            </div>
          </div>
        </Modal>
        )}

        {/* Edit Stage Modal */}
        {canManageContent && (
          <Modal 
            isOpen={showEditStage} 
            onClose={() => setShowEditStage(false)}
            title="Edit Stage"
          >
          {editingStage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editStageName">Name</Label>
                <Input
                  id="editStageName"
                  value={editingStage.name}
                  onChange={(e) =>
                    setEditingStage({ ...editingStage, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editStageType">Type</Label>
                <Input
                  id="editStageType"
                  value={editingStage.type || ""}
                  onChange={(e) =>
                    setEditingStage({ ...editingStage, type: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editStageStatus">Status</Label>
                <Select
                  value={editingStage.status}
                  onValueChange={(value: "indoor" | "outdoor") =>
                    setEditingStage({ ...editingStage, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStageCategory">Category</Label>
                <Select
                  value={editingStage.categoryId || ""}
                  onValueChange={(value) =>
                    setEditingStage({ ...editingStage, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image</Label>
                <EquipmentMediaUpload
                  onUploadComplete={(result) => {
                    setEditingStage({
                      ...editingStage,
                      imageUrl: result.secure_url,
                      imagePublicId: result.public_id,
                      imageResourceType: result.resource_type,
                    });
                  }}
                  onUploadError={(error) => toast.error(error)}
                  onRemove={() => {
                    setEditingStage({
                      ...editingStage,
                      imageUrl: "",
                      imagePublicId: "",
                      imageResourceType: "image",
                    });
                  }}
                  currentMedia={editingStage.imageUrl ? {
                    url: editingStage.imageUrl,
                    public_id: editingStage.imagePublicId || "",
                    resource_type: editingStage.imageResourceType as "image" | "video" || "image"
                  } : undefined}
                />
              </div>
              <div>
                <Label htmlFor="editStageDescription">Description</Label>
                <Textarea
                  id="editStageDescription"
                  value={editingStage.description || ""}
                  onChange={(e) =>
                    setEditingStage({ ...editingStage, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditStage(false)}>
                  Cancel
                </Button>
                <Button onClick={updateStage}>Update</Button>
              </div>
            </div>
          )}
        </Modal>
        )}
      </div>
    </div>
  );
}
