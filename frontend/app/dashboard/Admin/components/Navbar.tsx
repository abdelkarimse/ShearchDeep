import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { House, Users, Book, Settings, LogOut } from "lucide-react";

import {
  Button,
} from "@/components/animate-ui/components/buttons/button";
import Logo from "../../../../public/vercel.svg";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="w-64 bg-white text-black border-r border-gray-200 flex flex-col justify-between p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold mb-8"><img   src={Logo.src} alt="Logo" className="w-16 h-16" /> </h1>
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex flex-col gap-3">
            <NavigationMenu.Item>
              <Button
                variant={"secondary"}
                className=" px-4 py-2 rounded w-full transition-colors text-left flex justify-start items-start"
                onClick={() => router.push("/dashboard/Admin/")}
              >
                <House size={20} className="mt-0.5" />
                Home
              </Button>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <Button
                onClick={() => router.push("/dashboard/Admin/Users")}
                variant={"secondary"}
                className=" px-4 py-2 rounded w-full transition-colors text-left flex justify-start items-start"
              >
                <Users />
                Users
              </Button>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <Button
                onClick={() => router.push("/dashboard/Admin/Books")}
                variant={"secondary"}
                className=" px-4 py-2 rounded w-full transition-colors text-left flex justify-start items-start"
              >
                <Book />
                Books
              </Button>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>

      {/* Logout Button at bottom */}
      <Button
        variant={"destructive"}
        className="flex justify-center items-center px-4 py-2 rounded w-full transition-colors text-center"
        onClick={() => signOut()}
      >
        <LogOut />
        Logout
      </Button>
    </nav>
  );
}
