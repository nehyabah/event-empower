import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * One field of an application, shown whether or not it was filled in.
 *
 * Hiding empty fields made a thin application look identical to a complete
 * one — the reviewer had to remember what should have been there. Every
 * expected field is rendered, and a blank one says so.
 */
export const ReviewField = ({
  label,
  value,
  required = false,
  href,
}: {
  label: string;
  value: string | null | undefined;
  /** Missing required fields are counted in the summary and coloured. */
  required?: boolean;
  href?: string;
}) => {
  const filled = value !== null && value !== undefined && String(value).trim() !== "";

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-1 text-slate-400 normal-case font-normal">(required)</span>}
      </span>
      {filled ? (
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-words"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-slate-900 break-words whitespace-pre-wrap">{value}</span>
        )
      ) : (
        <span
          className={`text-sm italic ${required ? "text-amber-700" : "text-slate-400"}`}
        >
          Not provided
        </span>
      )}
    </div>
  );
};

/**
 * What is still missing, at the top of the page, so a reviewer does not have
 * to scan every field to work out whether an application is ready.
 */
export const CompletenessSummary = ({
  fields,
}: {
  fields: Array<{ label: string; value: unknown; required?: boolean }>;
}) => {
  const isEmpty = (v: unknown) =>
    v === null ||
    v === undefined ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);

  const missingRequired = fields.filter((f) => f.required && isEmpty(f.value)).map((f) => f.label);
  const missingOptional = fields.filter((f) => !f.required && isEmpty(f.value)).map((f) => f.label);

  if (missingRequired.length === 0 && missingOptional.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        <p className="text-sm text-green-900">Everything has been filled in.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${
        missingRequired.length > 0
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <AlertCircle
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          missingRequired.length > 0 ? "text-amber-600" : "text-slate-400"
        }`}
      />
      <div className="text-sm space-y-1">
        {missingRequired.length > 0 && (
          <p className="text-amber-900">
            <span className="font-medium">Missing required:</span> {missingRequired.join(", ")}
          </p>
        )}
        {missingOptional.length > 0 && (
          <p className="text-slate-600">
            <span className="font-medium">Also blank:</span> {missingOptional.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};
