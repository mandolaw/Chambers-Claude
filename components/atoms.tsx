import type { ReactNode } from "react";
import { sn } from "@/lib/theme";

export const Rule = () => <div style={{ height: "1px", background: "rgba(200,168,107,0.09)" }} />;

export const Lbl = ({
  children,
  color = "#9A9080",
  mb = "10px",
}: {
  children: ReactNode;
  color?: string;
  mb?: string;
}) => (
  <div style={{ ...sn, fontSize: "7px", letterSpacing: "5px", textTransform: "uppercase", color, marginBottom: mb }}>
    {children}
  </div>
);
