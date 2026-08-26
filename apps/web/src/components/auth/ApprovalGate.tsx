import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useApproval from "@/hooks/useApproval";

/**
 * Disables an action until the signed-in professional is approved.
 *
 * The API refuses these calls anyway, so this exists to stop someone clicking
 * a button that can only fail — and to say why, which a 403 toast does badly.
 *
 * The child is wrapped rather than cloned: `pointer-events-none` on the inner
 * element kills the click while the outer span still receives hover, so the
 * tooltip explaining the block actually appears. Disabled buttons swallow
 * their own hover events, which is the usual reason these tooltips never show.
 */
interface ApprovalGateProps {
  children: ReactNode;
  /** Rendered instead of the tooltip wrapper once approved. */
  className?: string;
}

const ApprovalGate = ({ children, className }: ApprovalGateProps) => {
  const { blocked, blockedReason } = useApproval();

  if (!blocked) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex cursor-not-allowed ${className ?? ""}`}>
            <span className="pointer-events-none opacity-50">{children}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {blockedReason}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApprovalGate;
