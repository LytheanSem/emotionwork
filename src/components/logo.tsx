import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 150, height = 50 }: LogoProps) {
  const combinedClassName = className ? `flex items-center ${className}`.trim() : "flex items-center";

  return (
    <div className={combinedClassName}>
      <div className="flex items-center space-x-2 group">
        {/* Logo Image */}
        <div className="relative w-24 h-24 group-hover:scale-105 transition-transform duration-300">
          <Image
            src="/logo_3.png"
            alt="Visual Emotion Work"
            fill
            className="drop-shadow-lg w-24 h-24 object-contain"
            priority={true}
            style={{
              filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.3))",
            }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-white font-black text-lg leading-tight tracking-tight group-hover:text-cyan-300 transition-colors duration-300">
            VISUAL
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-black text-lg leading-tight tracking-tight group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
            EMOTIONWORK
          </span>
        </div>
      </div>
    </div>
  );
}
