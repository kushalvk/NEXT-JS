import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-ink-300 bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 shadow-e1 transition outline-none",
        "placeholder:text-ink-400 selection:bg-brand-500 selection:text-white",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12",
        "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
        "aria-invalid:border-danger aria-invalid:ring-danger/15",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
