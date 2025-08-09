import type { FunctionComponent } from "react";
import ChatApp from "./ChatApp";

const registry: Record<string, FunctionComponent<any>> = {
  chat: ChatApp,
};

export function getIslandBySlug(slug: string): FunctionComponent<any> | null {
  return registry[slug] || null;
}

export function listIslands() {
  return Object.keys(registry);
}
