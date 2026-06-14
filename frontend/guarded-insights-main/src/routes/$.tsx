import { createFileRoute } from "@tanstack/react-router";
import { AppClient } from "@/app/AppClient";

export const Route = createFileRoute("/$")({
  component: AppClient,
});
