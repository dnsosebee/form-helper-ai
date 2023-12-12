import z from "zod";

// OUTGOING EVENTS
export const TransportChunk = z.object({
  type: z.literal("chunk"),
  name: z.string(),
  arguments: z.string(),
});
export type TransportChunk = z.infer<typeof TransportChunk>;

export const TransportComplete = z.object({
  type: z.literal("complete"),
});
export type TransportComplete = z.infer<typeof TransportComplete>;

export const TransportError = z.object({
  type: z.literal("error"),
  message: z.string(),
});
export type TransportError = z.infer<typeof TransportError>;

export const Transport = z.union([TransportChunk, TransportComplete, TransportError]);
export type Transport = z.infer<typeof Transport>;
