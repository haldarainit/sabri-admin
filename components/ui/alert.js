import * as React from "react";

const Alert = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-background text-foreground border",
      destructive: "border-red-200 bg-red-50 text-red-800",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`text-sm ${className}`} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
