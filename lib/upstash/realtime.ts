import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { z } from "zod";
import { redis } from "./redis";

const schema = {
  activity: {
    created: z.object({
      action: z.string(),
      module: z.string(),
      submodule: z.string().nullable(),
      recordId: z.string().nullable(),
      user: z.string().nullable(),
      createdAt: z.string(),
    }),
  },
};

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
