import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLoginPage } from "./admin-login";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: AdminLoginPage,
});
