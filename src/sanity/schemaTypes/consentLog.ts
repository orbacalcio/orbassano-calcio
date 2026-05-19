import { ShieldCheck } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Log dei consensi cookie GDPR. Ogni accettazione/modifica del banner
 * genera un record qui per audit. Il banner cookie chiama un'API
 * server che scrive in Sanity con il write token.
 *
 * In Studio sarà read-only: i record arrivano da scritture server
 * automatizzate, non da edit manuale.
 */
export const consentLog = defineType({
  name: "consentLog",
  title: "Log consensi cookie",
  type: "document",
  icon: ShieldCheck,
  readOnly: true,
  fields: [
    defineField({
      name: "consentId",
      title: "ID consenso",
      type: "string",
      description: "UUID generato lato client e salvato in localStorage.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "timestamp",
      title: "Timestamp",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "action",
      title: "Azione",
      type: "string",
      options: {
        list: ["accept-all", "reject-all", "save-preferences", "withdrawn"],
      },
    }),
    defineField({
      name: "categories",
      title: "Categorie accettate",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: ["necessary", "analytics", "marketing", "embed-social"],
      },
    }),
    defineField({
      name: "userAgent",
      title: "User agent",
      type: "string",
    }),
    defineField({
      name: "ipHash",
      title: "Hash IP (sha256, no IP plain)",
      type: "string",
    }),
    defineField({
      name: "policyVersion",
      title: "Versione cookie policy",
      type: "string",
    }),
  ],
  preview: {
    select: {
      action: "action",
      timestamp: "timestamp",
      consentId: "consentId",
    },
    prepare({ action, timestamp, consentId }) {
      const when = timestamp
        ? new Date(timestamp).toLocaleString("it-IT")
        : "—";
      return {
        title: `${action ?? "?"} · ${when}`,
        subtitle: consentId?.slice(0, 8),
      };
    },
  },
});
