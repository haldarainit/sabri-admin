import * as React from "react";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={`h-4 w-4 rounded border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        checked ? "bg-blue-600 border-blue-600" : "bg-white"
      } ${className}`}
      {...props}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </button>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
