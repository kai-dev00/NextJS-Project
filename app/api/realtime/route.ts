import { realtime } from "@/lib/upstash/realtime";
import { handle } from "@upstash/realtime";

export const GET = handle({ realtime });
