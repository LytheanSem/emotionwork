"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { VirtualList } from "@/components/ui/virtual-list";
import { useUserListVirtualScroll } from "@/hooks/use-virtual-scroll";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  image?: string;
  provider: string;
  createdAt: string;
  collection?: "adminUsers" | "regularUsers";
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
  image?: string | File;
  description?: string;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Virtual scrolling configuration
  const userListConfig = useUserListVirtualScroll();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("users");

  // Modal states
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "user" as "user" | "admin",
  });
  const [showCreateEquipment, setShowCreateEquipment] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    brand: "",
    status: "available" as "available" | "in_use" | "maintenance",
    quantity: 1,
    categoryId: "",
    image: null as File | null,
    description: "",
  });

  // Edit modal states
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditEquipment, setShowEditEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );

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

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);

      // Load users
      const usersResponse = await fetch("/api/admin/users");
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Load categories
      const categoriesResponse = await fetch("/api/admin/categories");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

      // Load equipment
      const equipmentResponse = await fetch("/api/admin/equipment");
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        setEquipment(equipmentData.equipment || []);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/");
      return;
    }

    // Load admin data
    loadAdminData();
  }, [session, status, router, loadAdminData]);

  // Create category function
  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        toast.success("Category created successfully!");
        setNewCategory({ name: "", description: "" });
        setShowCreateCategory(false);
        loadAdminData(); // Reload data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  // Create user
  const createUser = async () => {
    console.log("Creating user:", newUser);
    const { username, email, role } = newUser;
    if (!username.trim() || !email.trim()) {
      toast.error("Username and email are required");
      return;
    }
    try {
      console.log("Sending request to /api/admin/users");
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, role }),
      });
      console.log("Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Success response:", data);
        toast.success("User created");
        setShowCreateUser(false);
        setNewUser({ username: "", email: "", role: "user" });
        loadAdminData();
      } else {
        const data = await res.json();
        console.log("Error response:", data);
        toast.error(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user");
    }
  };

  // Create equipment
  const createEquipment = async () => {
    console.log("Creating equipment:", newEquipment);
    const { name, status, quantity, brand, categoryId, image, description } =
      newEquipment;
    if (!name.trim() || quantity < 1) {
      toast.error("Name and quantity are required");
      return;
    }
    try {
      console.log("Sending request to /api/admin/equipment");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("status", status);
      formData.append("quantity", quantity.toString());
      formData.append("brand", brand || "");
      formData.append("categoryId", categoryId || "");
      if (image) {
        formData.append("image", image);
      }
      formData.append("description", description || "");

      const res = await fetch("/api/admin/equipment", {
        method: "POST",
        body: formData,
      });
      console.log("Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Success response:", data);
        toast.success("Equipment created");
        setShowCreateEquipment(false);
        setNewEquipment({
          name: "",
          brand: "",
          status: "available",
          quantity: 1,
          categoryId: "",
          image: null,
          description: "",
        });
        loadAdminData();
      } else {
        const data = await res.json();
        console.log("Error response:", data);
        toast.error(data.error || "Failed to create equipment");
      }
    } catch (error) {
      console.error("Failed to create equipment:", error);
      toast.error("Failed to create equipment");
    }
  };

  // Promote user function
  const promoteUser = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(`/api/admin/users/${userId}/promote`, {
          method: "PATCH",
        });

        if (response.ok) {
          toast.success("User promoted to admin successfully!");
          loadAdminData(); // Reload data
        } else {
          toast.error("Failed to promote user");
        }
      } catch (error) {
        console.error("Error promoting user:", error);
        toast.error("Failed to promote user");
      }
    },
    [loadAdminData]
  );

  // Delete functions for each collection
  const deleteUser = useCallback(
    async (userId: string) => {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("User deleted successfully!");
          loadAdminData(); // Reload data
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    },
    [loadAdminData]
  );

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully!");
        loadAdminData(); // Reload data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const deleteEquipment = async (equipmentId: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const response = await fetch(`/api/admin/equipment/${equipmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Equipment deleted successfully!");
        loadAdminData(); // Reload data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete equipment");
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment");
    }
  };

  // Edit handlers
  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setShowEditUser(true);
  }, []);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategory(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowEditEquipment(true);
  };

  // Update handlers
  const updateUser = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email,
          role: editingUser.role,
        }),
      });

      if (res.ok) {
        toast.success("User updated successfully");
        setShowEditUser(false);
        setEditingUser(null);
        loadAdminData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user");
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCategory.name,
          description: editingCategory.description,
        }),
      });

      if (res.ok) {
        toast.success("Category updated successfully");
        setShowEditCategory(false);
        setEditingCategory(null);
        loadAdminData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("Failed to update category");
    }
  };

  const updateEquipment = async () => {
    if (!editingEquipment) return;

    try {
      const formData = new FormData();
      formData.append("name", editingEquipment.name);
      formData.append("brand", editingEquipment.brand || "");
      formData.append("status", editingEquipment.status);
      formData.append("quantity", editingEquipment.quantity.toString());
      formData.append("categoryId", editingEquipment.categoryId || "");
      if (editingEquipment.image instanceof File) {
        formData.append("image", editingEquipment.image);
      }
      formData.append("description", editingEquipment.description || "");

      const res = await fetch(`/api/admin/equipment/${editingEquipment.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        toast.success("Equipment updated successfully");
        setShowEditEquipment(false);
        setEditingEquipment(null);
        loadAdminData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update equipment");
      }
    } catch (error) {
      console.error("Failed to update equipment:", error);
      toast.error("Failed to update equipment");
    }
  };

  // Optimized render functions with virtualization
  const renderUserItem = useCallback(
    (user: User) => (
      <div
        key={user.id}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          {user.image && (
            <Image
              src={user.image}
              alt={user.username}
              width={40}
              height={40}
              className="rounded-full"
              loading="lazy"
            />
          )}
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              <Badge variant="outline">{user.provider}</Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditUser(user)}
          >
            Edit
          </Button>
          {user.role === "user" && (
            <Button
              size="sm"
              onClick={() => promoteUser(user.id)}
              variant="outline"
            >
              Promote
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteUser(user.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    ),
    [handleEditUser, promoteUser, deleteUser]
  );

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

  if (!session?.user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You need admin privileges to access this page.
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Welcome back, {session.user.name || session.user.email}
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Session
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Badge variant="secondary">{users.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter((u) => u.role === "admin").length} admins,{" "}
                {users.filter((u) => u.role === "user").length} users
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Badge variant="secondary">{categories.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                Equipment categories
              </p>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment</CardTitle>
              <Badge variant="secondary">{equipment.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipment.length}</div>
              <p className="text-xs text-muted-foreground">
                Total equipment items
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Search users, categories, or equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="categories">
              Categories ({filteredCategories.length})
            </TabsTrigger>
            <TabsTrigger value="equipment">
              Equipment ({filteredEquipment.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Admin Users Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      👑 Admin Users
                      <Badge variant="default">
                        {users.filter((u) => u.role === "admin").length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Manage administrator accounts and permissions
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowCreateUser(true)}>
                    Add Admin User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.filter((user) => user.role === "admin")
                    .length > 0 ? (
                    <VirtualList
                      items={filteredUsers.filter(
                        (user) => user.role === "admin"
                      )}
                      height={userListConfig.containerHeight}
                      itemHeight={userListConfig.itemHeight}
                      overscanCount={userListConfig.overscanCount}
                      renderItemAction={(user) => renderUserItem(user)}
                      className="border rounded-lg"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No admin users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Regular Users Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      👤 Regular Users
                      <Badge variant="secondary">
                        {users.filter((u) => u.role === "user").length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Manage regular user accounts and profiles
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowCreateUser(true)}>
                    Add Regular User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.filter((user) => user.role === "user").length >
                  0 ? (
                    <VirtualList
                      items={filteredUsers.filter(
                        (user) => user.role === "user"
                      )}
                      height={userListConfig.containerHeight}
                      itemHeight={userListConfig.itemHeight}
                      overscanCount={userListConfig.overscanCount}
                      renderItemAction={(user) => renderUserItem(user)}
                      className="border rounded-lg"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No regular users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Category Management</CardTitle>
                    <CardDescription>
                      Manage equipment categories
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowCreateCategory(true)}>
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-600">
                          {category.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Slug: {category.slug}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Equipment Management</CardTitle>
                    <CardDescription>
                      Manage equipment inventory
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateEquipment(true)}
                  >
                    Add Equipment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEquipment.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {item.image ? (
                          // Check if image is a valid URL or path
                          typeof item.image === "string" &&
                          (item.image.startsWith("http") ||
                          item.image.startsWith("/") ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="object-cover rounded-lg"
                              loading="lazy"
                            />
                          ) : (
                            // Show placeholder for ObjectIds or invalid paths
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                Image
                              </span>
                            </div>
                          ))
                        ) : (
                          // No image provided
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No Image
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.brand || "No brand"}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
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
                            <Badge variant="outline">
                              Qty: {item.quantity}
                            </Badge>
                            {item.category && (
                              <Badge variant="outline">
                                {item.category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEquipment(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteEquipment(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        title="Create New Category"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Category form submitted");
            createCategory();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="categoryDescription">Description (Optional)</Label>
            <Textarea
              id="categoryDescription"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <Button type="submit">Create Category</Button>
        </form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        title="Create New User"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("User form submitted");
            createUser();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="w-full border rounded-md h-9 px-3"
              value={newUser.role}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role: e.target.value as "user" | "admin",
                })
              }
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <Button type="submit">Create User</Button>
        </form>
      </Modal>

      {/* Create Equipment Modal */}
      <Modal
        isOpen={showCreateEquipment}
        onClose={() => setShowCreateEquipment(false)}
        title="Create New Equipment"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Equipment form submitted");
            createEquipment();
          }}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div>
            <Label htmlFor="eqName">Name</Label>
            <Input
              id="eqName"
              value={newEquipment.name}
              onChange={(e) =>
                setNewEquipment({ ...newEquipment, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eqBrand">Brand</Label>
              <Input
                id="eqBrand"
                value={newEquipment.brand}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, brand: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="eqStatus">Status</Label>
              <select
                id="eqStatus"
                className="w-full border rounded-md h-9 px-3"
                value={newEquipment.status}
                onChange={(e) =>
                  setNewEquipment({
                    ...newEquipment,
                    status: e.target.value as
                      | "available"
                      | "in_use"
                      | "maintenance",
                  })
                }
              >
                <option value="available">available</option>
                <option value="in_use">in_use</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eqQty">Quantity</Label>
              <Input
                id="eqQty"
                type="number"
                min={1}
                value={newEquipment.quantity}
                onChange={(e) =>
                  setNewEquipment({
                    ...newEquipment,
                    quantity: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="eqCategory">Category</Label>
              <select
                id="eqCategory"
                className="w-full border rounded-md h-9 px-3"
                value={newEquipment.categoryId}
                onChange={(e) =>
                  setNewEquipment({
                    ...newEquipment,
                    categoryId: e.target.value,
                  })
                }
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="eqImage">Equipment Image</Label>
            <Input
              id="eqImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setNewEquipment({ ...newEquipment, image: file });
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload an image from your local drive (JPG, PNG, GIF)
            </p>
          </div>
          <div>
            <Label htmlFor="eqDesc">Description</Label>
            <Textarea
              id="eqDesc"
              rows={3}
              value={newEquipment.description}
              onChange={(e) =>
                setNewEquipment({
                  ...newEquipment,
                  description: e.target.value,
                })
              }
            />
          </div>
          <Button type="submit">Create Equipment</Button>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditUser}
        onClose={() => {
          setShowEditUser(false);
          setEditingUser(null);
        }}
        title="Edit User"
      >
        {editingUser && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUser();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="editUsername">Username</Label>
              <Input
                id="editUsername"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="editRole">Role</Label>
              <select
                id="editRole"
                className="w-full border rounded-md h-9 px-3"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as "user" | "admin",
                  })
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <Button type="submit">Update User</Button>
          </form>
        )}
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditCategory}
        onClose={() => {
          setShowEditCategory(false);
          setEditingCategory(null);
        }}
        title="Edit Category"
      >
        {editingCategory && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCategory();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="editCategoryName">Category Name</Label>
              <Input
                id="editCategoryName"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="editCategoryDescription">
                Description (Optional)
              </Label>
              <Textarea
                id="editCategoryDescription"
                value={editingCategory.description || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <Button type="submit">Update Category</Button>
          </form>
        )}
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal
        isOpen={showEditEquipment}
        onClose={() => {
          setShowEditEquipment(false);
          setEditingEquipment(null);
        }}
        title="Edit Equipment"
        size="lg"
      >
        {editingEquipment && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateEquipment();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="editEqName">Name</Label>
              <Input
                id="editEqName"
                value={editingEquipment.name}
                onChange={(e) =>
                  setEditingEquipment({
                    ...editingEquipment,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editEqBrand">Brand</Label>
                <Input
                  id="editEqBrand"
                  value={editingEquipment.brand || ""}
                  onChange={(e) =>
                    setEditingEquipment({
                      ...editingEquipment,
                      brand: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editEqStatus">Status</Label>
                <select
                  id="editEqStatus"
                  className="w-full border rounded-md h-9 px-3"
                  value={editingEquipment.status}
                  onChange={(e) =>
                    setEditingEquipment({
                      ...editingEquipment,
                      status: e.target.value as
                        | "available"
                        | "in_use"
                        | "maintenance",
                    })
                  }
                >
                  <option value="available">available</option>
                  <option value="in_use">in_use</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editEqQty">Quantity</Label>
                <Input
                  id="editEqQty"
                  type="number"
                  min={1}
                  value={editingEquipment.quantity}
                  onChange={(e) =>
                    setEditingEquipment({
                      ...editingEquipment,
                      quantity: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEqCategory">Category</Label>
                <select
                  id="editEqCategory"
                  className="w-full border rounded-md h-9 px-3"
                  value={editingEquipment.categoryId || ""}
                  onChange={(e) =>
                    setEditingEquipment({
                      ...editingEquipment,
                      categoryId: e.target.value,
                    })
                  }
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="editEqImage">Equipment Image</Label>
              <Input
                id="editEqImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditingEquipment({
                      ...editingEquipment,
                      image: file,
                    });
                  }
                }}
              />
              {typeof editingEquipment.image === "string" &&
                editingEquipment.image && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current image: {editingEquipment.image}
                  </p>
                )}
              <p className="text-xs text-gray-500 mt-1">
                Upload a new image to replace the current one (JPG, PNG, GIF)
              </p>
            </div>
            <div>
              <Label htmlFor="editEqDesc">Description</Label>
              <Textarea
                id="editEqDesc"
                rows={3}
                value={editingEquipment.description || ""}
                onChange={(e) =>
                  setEditingEquipment({
                    ...editingEquipment,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <Button type="submit">Update Equipment</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
