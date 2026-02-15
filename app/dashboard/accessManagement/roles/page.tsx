import { getCurrentUserWithDetails } from "@/lib/auth";
import { getRoles } from "../actions/roles";
import { RolesManagementClient } from "../components/RolesManagementClient";

export default async function RolesPage() {
  const roles = await getRoles();
  const permissionData = await getCurrentUserWithDetails();
  const permissions = permissionData?.role?.permissions || [];

  return <RolesManagementClient roles={roles} permissions={permissions} />;
}
