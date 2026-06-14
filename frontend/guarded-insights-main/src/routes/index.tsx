import { createFileRoute } from "@tanstack/react-router";
import { AppClient } from "@/app/AppClient";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OWASP GUARD — Professional Web Security Scanner" },
      {
        name: "description",
        content:
          "OWASP GUARD is a professional web application security platform powered by OWASP ZAP. Discover, analyze, and remediate vulnerabilities.",
      },
      { property: "og:title", content: "OWASP GUARD" },
      {
        property: "og:description",
        content: "Professional web application security scanning powered by OWASP ZAP.",
      },
    ],
  }),
  component: AppClient,
});
