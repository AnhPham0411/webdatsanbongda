import { auth } from "@/lib/auth";

export const getRole = async () => {
  const session = await auth();
  return session?.user?.role;
};

export const isAdmin = async () => (await getRole()) === "ADMIN";
export const isStaff = async () => {
  const role = await getRole();
  return role === "ADMIN" || role === "STAFF";
};