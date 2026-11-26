import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-12 w-full min-w-0 rounded-field border-2 border-border bg-field px-4 py-2.5 text-base font-semibold text-foreground shadow-[0_3px_0_var(--muted)] transition-[border-color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground hover:border-control-edge disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_var(--volt)] dark:focus-visible:shadow-[0_0_0_4px_rgb(216_244_90/0.25)]",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_4px_var(--destructive-soft)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
