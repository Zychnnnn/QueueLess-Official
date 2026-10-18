import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/staff-login")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: StaffLoginPage,
});

export function StaffLoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/" });
  }, [navigate]);
  return null;
}