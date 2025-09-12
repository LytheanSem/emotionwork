import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 500, height = 500}: LogoProps) {
  const combinedClassName = className ? `flex items-center ${className}`.trim() : "flex items-center";
  
  return (
    <div className={combinedClassName}>
      <Image
        src="/Logo.png"
        alt="Visual Emotion Work"
        width={width}
        height={height}
        className="h-auto w-auto object-contain"
        priority={true}
        unoptimized={false}
      />
    </div>
  );
}
