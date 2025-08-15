import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 200, height = 120 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/LOGO.JPG"
        alt="Visual Emotion Work"
        width={width}
        height={height}
        className="h-auto w-auto object-contain"
        priority
      />
    </div>
  );
}
