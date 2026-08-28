import { ShieldAlert } from "lucide-react";

/**
 * The standing rule shown above every chat.
 *
 * Kept in one component so the wording cannot drift between the vendor
 * inquiry thread and the workspace chat - people should see the same rule in
 * the same words wherever they are talking.
 */
export const ChatSafetyBanner = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-start gap-2 border-b bg-amber-50 px-4 py-2.5 text-xs text-amber-900 ${className}`}
  >
    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
    <p>
      <span className="font-medium">Keep it on àjọyọ.</span> Don't share phone numbers,
      emails or links — in messages or in images. Chats are monitored for safety, and
      breaking this can get an account disabled.
    </p>
  </div>
);

/**
 * Fuller version, shown once before a conversation starts. The banner above
 * is a reminder; this is the part someone actually reads.
 */
export const ChatSafetyIntro = ({ onAccept }: { onAccept: () => void }) => (
  <div className="rounded-xl border bg-card p-5 space-y-4">
    <div className="flex items-start gap-3">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <h3 className="font-medium">Before you start</h3>
        <p className="text-sm text-muted-foreground mt-1">
          A few things that keep everyone safe.
        </p>
      </div>
    </div>

    <ul className="space-y-2.5 text-sm text-muted-foreground">
      <li className="flex gap-2">
        <span aria-hidden>•</span>
        <span>
          <span className="font-medium text-foreground">Keep the conversation here.</span>{" "}
          Don't share phone numbers, email addresses or links — including inside a
          photo or screenshot. Messages that look like contact details are blocked
          automatically.
        </span>
      </li>
      <li className="flex gap-2">
        <span aria-hidden>•</span>
        <span>
          <span className="font-medium text-foreground">Contact details unlock on booking.</span>{" "}
          Once this vendor is booked, you'll both see each other's full details and can
          arrange things directly.
        </span>
      </li>
      <li className="flex gap-2">
        <span aria-hidden>•</span>
        <span>
          <span className="font-medium text-foreground">Never pay outside the platform</span>{" "}
          on the strength of a chat message. If someone pressures you to move to
          WhatsApp or pay a deposit off-platform, that's worth reporting.
        </span>
      </li>
      <li className="flex gap-2">
        <span aria-hidden>•</span>
        <span>
          Chats are monitored for safety. Repeated violations may result in an account
          being disabled.
        </span>
      </li>
    </ul>

    <button
      type="button"
      onClick={onAccept}
      className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      I understand — start chatting
    </button>
  </div>
);
