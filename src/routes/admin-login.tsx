import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin-login")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: AdminLoginPage,
});

export function AdminLoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/" });
  }, [navigate]);
  return null;
}
