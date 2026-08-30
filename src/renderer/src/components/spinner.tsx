import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

export default function Spinner({ className }: { className?: string }): React.JSX.Element {
  return <Loader2 className={cn("animate-spin", className)} />;
}
