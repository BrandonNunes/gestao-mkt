interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    outline: "border text-foreground",
  };
  return <span className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
