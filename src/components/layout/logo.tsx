import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "nav" | "stack" | "mark";
  onDark?: boolean;
};

export function Logo({
  className,
  variant = "nav",
  onDark = true,
}: LogoProps) {
  const emblem = onDark ? "/brand/emblem-white.png" : "/brand/emblem.png";
  const wordmark = onDark ? "/brand/wordmark-white.png" : "/brand/wordmark.png";

  if (variant === "stack") {
    return (
      <span className={cn("inline-flex flex-col items-start", className)}>
        <Image
          src={emblem}
          alt="RAX Cut Co."
          width={900}
          height={883}
          className="h-[88px] w-auto"
        />
        <Image
          src={wordmark}
          alt=""
          width={1400}
          height={360}
          className="mt-3 h-11 w-auto max-w-[250px]"
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={emblem}
        alt="RAX Cut Co."
        width={900}
        height={883}
        priority={variant === "nav"}
        className={cn("w-auto", variant === "nav" ? "h-[52px] sm:h-[58px]" : "h-12")}
      />
    </span>
  );
}
