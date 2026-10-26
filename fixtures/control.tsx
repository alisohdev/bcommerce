import { useState } from "react";

export async function start() {
  await Promise.resolve("handled");
}
export const indexed: string | undefined = ["present"][2];
export const optional: { value?: string } = {};
export function Control({ visible }: { visible: boolean }) {
  const [value] = useState("valid");
  return visible ? <span>{value}</span> : null;
}
