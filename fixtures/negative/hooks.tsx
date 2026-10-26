import { useState } from "react";

export function InvalidHook({ visible }: { visible: boolean }) {
  if (visible) {
    const [value] = useState("invalid");
    return <span>{value}</span>;
  }
  return null;
}
