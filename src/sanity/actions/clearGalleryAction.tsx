"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentActionDescription,
} from "sanity";

/**
 * Document Action "Svuota tutte le foto" per il document type `gallery`.
 *
 * Aggiunge nel menu kebab (⋯) della toolbar dello Studio una voce
 * critical-tone che, dopo conferma esplicita, imposta `images: []`
 * sul documento corrente in un colpo solo.
 *
 * NB: l'operazione svuota SOLO l'array `images` del documento.
 * Gli asset (i file immagine veri e propri) restano nel CDN Sanity
 * e in Library, quindi se ne servono di nuovo si possono riallegare.
 *
 * Registrazione: sanity.config.ts → `document.actions` con filtro
 * `schemaType === 'gallery'`.
 */
export const ClearGalleryAction: DocumentActionComponent = (
  props,
): DocumentActionDescription | null => {
  const { id, type, onComplete } = props;
  const { patch } = useDocumentOperation(id, type);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Difesa-in-profondita': l'azione viene filtrata via context in
  // sanity.config.ts, ma se per qualche motivo arriva qui con un
  // altro tipo, restituiamo null (non appare nel menu).
  if (type !== "gallery") return null;

  return {
    label: "Svuota tutte le foto",
    icon: Trash2,
    tone: "critical",
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen
      ? {
          type: "confirm",
          tone: "critical",
          message:
            "Svuota tutte le foto dell'album. Sei sicuro? L'array delle foto di questo album verra' azzerato. Gli asset originali restano disponibili nella libreria Sanity (puoi recuperarli da li' se servono), ma scompariranno da questo album.",
          onCancel: () => setDialogOpen(false),
          onConfirm: () => {
            patch.execute([{ set: { images: [] } }]);
            setDialogOpen(false);
            onComplete();
          },
        }
      : null,
  };
};
