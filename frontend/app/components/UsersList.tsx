"use client";
import { useState } from "react";
import { useTheme } from "../Zustand/themeStore";
import type { User } from "../types/users";
import { UserCard } from "./UserCard";
import { UserPopup } from "./UserPopup";
import { ConfirmDelete } from "./ConfirmDelete";

const getThemeClasses = (isDark: boolean) => ({
  bgColor: isDark ? "bg-gray-900" : "bg-gray-50",
  textColor: isDark ? "text-gray-100" : "text-gray-900",
  inputBg: isDark
    ? "bg-gray-800 text-gray-100 border-gray-700"
    : "bg-white text-gray-900 border-gray-300",
  cardBg: isDark ? "bg-gray-800" : "bg-white",
  borderColor: isDark ? "border-gray-700" : "border-gray-200",
  secondaryText: isDark ? "text-gray-400" : "text-gray-600",
});

const getSampleUsers = (): User[] => [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    role: "Admin",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 234-5678",
    role: "User",
    status: "active",
    joinDate: "2024-02-20",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1 (555) 345-6789",
    role: "Moderator",
    status: "inactive",
    joinDate: "2024-03-10",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+1 (555) 456-7890",
    role: "User",
    status: "active",
    joinDate: "2024-04-05",
  },
];

interface UserStatsProps {
  users: User[];
  classes: ReturnType<typeof getThemeClasses>;
}

const UserStats: React.FC<UserStatsProps> = ({ users, classes }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
    <div
      className={`${classes.cardBg} rounded-lg p-4 text-center border ${classes.borderColor}`}
    >
      <p className={classes.secondaryText}>Total Users</p>
      <p className={`${classes.textColor} text-2xl font-bold`}>
        {users.length}
      </p>
    </div>
    <div
      className={`${classes.cardBg} rounded-lg p-4 text-center border ${classes.borderColor}`}
    >
      <p className={classes.secondaryText}>Active</p>
      <p className={`${classes.textColor} text-2xl font-bold`}>
        {users.filter((u) => u.status === "active").length}
      </p>
    </div>
    <div
      className={`${classes.cardBg} rounded-lg p-4 text-center border ${classes.borderColor}`}
    >
      <p className={classes.secondaryText}>Inactive</p>
      <p className={`${classes.textColor} text-2xl font-bold`}>
        {users.filter((u) => u.status === "inactive").length}
      </p>
    </div>
    <div
      className={`${classes.cardBg} rounded-lg p-4 text-center border ${classes.borderColor}`}
    >
      <p className={classes.secondaryText}>Admins</p>
      <p className={`${classes.textColor} text-2xl font-bold`}>
        {users.filter((u) => u.role === "Admin").length}
      </p>
    </div>
  </div>
);

export const UsersList: React.FC = () => {
  const theme = useTheme();
  const isDark = theme === "dark";
  const classes = getThemeClasses(isDark);
  const [users, setUsers] = useState<User[]>(getSampleUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleAddUser = () => {
    setPopupMode("add");
    setSelectedUser(undefined);
    setIsPopupOpen(true);
  };

  const handleEditUser = (user: User) => {
    setPopupMode("edit");
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setUserToDelete(null);
  };

  const handleSubmitPopup = (userData: Partial<User>) => {
    if (popupMode === "add") {
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        role: userData.role || "User",
        status: (userData.status as "active" | "inactive") || "active",
        joinDate: userData.joinDate || new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
    } else if (selectedUser) {
      setUsers(
        users.map((u) => (u.id === selectedUser.id ? { ...u, ...userData } : u))
      );
    }
    setIsPopupOpen(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${classes.bgColor} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`${classes.textColor} text-3xl font-bold mb-2`}>
            Users Management
          </h1>
          <p className={classes.secondaryText}>
            View and manage all users in the system
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${classes.inputBg}`}
          />
          <button
            onClick={handleAddUser}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Add User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            ))
          ) : (
            <div
              className={`${classes.textColor} col-span-full text-center py-12`}
            >
              <p className="text-lg">No users found</p>
            </div>
          )}
        </div>

        <UserPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onSubmit={handleSubmitPopup}
          user={selectedUser}
          mode={popupMode}
        />

        <ConfirmDelete
          isOpen={confirmDeleteOpen}
          userName={userToDelete?.name || ""}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        <UserStats users={users} classes={classes} />
      </div>
    </div>
  );
};
