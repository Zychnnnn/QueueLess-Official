import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "./admin-login";

export const Route = createFileRoute("/admin")({
  component: AdminLoginPage,
});
