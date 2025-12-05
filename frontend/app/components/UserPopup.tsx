import { useState } from "react";
import { useTheme } from "../Zustand/themeStore";
import type { User } from "../types/users";

interface UserPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<User>) => void;
  user?: User;
  mode: "add" | "edit";
}

export const UserPopup: React.FC<UserPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
}) => {
  const theme = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState<Partial<User>>(
    user || {
      name: "",
      email: "",
      phone: "",
      role: "User",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
    }
  );

  // Dynamic Tailwind classes based on theme
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const inputBg = isDark
    ? "bg-gray-700 text-gray-100 border-gray-600"
    : "bg-gray-50 text-gray-900 border-gray-300";
  const labelColor = isDark ? "text-gray-300" : "text-gray-700";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form data after submission
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "User",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
    });
  };

  if (!isOpen) return null;

  // The overlay is defined here:
  // fixed inset-0: Covers the whole screen
  // bg-black bg-opacity-40: Semi-transparent black color
  // backdrop-blur-sm: Adds a subtle blur to content behind
  // flex items-center justify-center: Centers the modal content
  // z-50: Ensures it's on top of everything
  const overlayBg = isDark
    ? "bg-black/60 backdrop-blur-md"
    : "bg-white/50 backdrop-blur-sm";

  return (
    <div
      className={`
      fixed inset-0
      ${overlayBg}
      flex items-center justify-center
      z-50
      p-3 sm:p-6
      transition-all duration-300 ease-in-out
    `}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${bgColor} rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md max-h-[85vh] overflow-y-auto transform scale-100 transition-all duration-300 ease-out`}
        // Crucial: Stops clicks on the modal content from triggering the overlay's onClose
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className={`${textColor} text-xl sm:text-2xl font-bold mb-6`}>
          {mode === "add" ? "Add New User" : `Edit ${user?.name}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className={`${labelColor} block text-sm font-medium mb-2`}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
              placeholder="Enter user name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className={`${labelColor} block text-sm font-medium mb-2`}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className={`${labelColor} block text-sm font-medium mb-2`}
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className={`${labelColor} block text-sm font-medium mb-2`}
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role || "User"}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer transition-colors ${inputBg}`}
            >
              <option>User</option>
              <option>Admin</option>
              <option>Moderator</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className={`${labelColor} block text-sm font-medium mb-2`}
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status || "active"}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer transition-colors ${inputBg}`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-2">
            <label
              htmlFor="joinDate"
              className={`${labelColor} block text-sm font-medium mb-2`}
            >
              Join Date
            </label>
            <input
              id="joinDate"
              type="date"
              name="joinDate"
              value={
                formData.joinDate || new Date().toISOString().split("T")[0]
              }
              onChange={handleChange}
              required
              className={`w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputBg}`}
            />
          </div>

          <div
            className={`border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            } pt-4 flex gap-3`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm ${
                isDark
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm ${
                isDark
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {mode === "add" ? "Add User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
