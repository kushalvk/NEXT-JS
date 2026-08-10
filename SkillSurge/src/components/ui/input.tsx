import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-ink-300 bg-white px-3.5 py-2 text-[0.9375rem] text-ink-900 shadow-e1 transition outline-none",
        "placeholder:text-ink-400 selection:bg-brand-500 selection:text-white",
        "file:mr-3 file:inline-flex file:h-7 file:cursor-pointer file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:text-sm file:font-medium file:text-ink-700",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12",
        "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
        "aria-invalid:border-danger aria-invalid:ring-danger/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
