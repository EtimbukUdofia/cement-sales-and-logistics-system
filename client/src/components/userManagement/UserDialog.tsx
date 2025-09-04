import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type UserData, type CreateUserData, type UpdateUserData, type ShopData } from "@/lib/api"

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserData | null;
  shops: ShopData[];
  onSubmit: (userData: CreateUserData | UpdateUserData) => Promise<{ success: boolean; message?: string }>;
  isSubmitting: boolean;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  shops,
  onSubmit,
  isSubmitting
}: UserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "salesPerson" as "admin" | "salesPerson",
    shopId: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!user;

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          password: "",
          role: user.role,
          shopId: user.shopId || ""
        });
      } else {
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "salesPerson",
          shopId: ""
        });
      }
      setErrors({});
    }
  }, [open, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isEditing && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.role === "salesPerson" && !formData.shopId) {
      newErrors.shopId = "Shop assignment is required for sales personnel";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData = {
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      ...(formData.role === "salesPerson" && { shopId: formData.shopId }),
      ...(formData.password && { password: formData.password })
    };

    const result = await onSubmit(userData);
    if (result.success) {
      onOpenChange(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user information below. Leave password empty to keep current password."
              : "Fill in the information below to create a new user account."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              Password {isEditing ? "(leave empty to keep current)" : "*"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "salesPerson") => handleInputChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="salesPerson">Sales Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "salesPerson" && (
            <div className="grid gap-2">
              <Label htmlFor="shopId">Assigned Shop *</Label>
              <Select
                value={formData.shopId}
                onValueChange={(value) => handleInputChange("shopId", value)}
              >
                <SelectTrigger className={errors.shopId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop._id} value={shop._id}>
                      {shop.name} - {shop.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.shopId && (
                <p className="text-sm text-red-500">{errors.shopId}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
