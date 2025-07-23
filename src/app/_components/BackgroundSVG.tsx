export default function BackgroundSVG() {
  return (
    <div
      className="absolute inset-0 -z-10 h-full opacity-50"
      style={{
        backgroundImage: "url(/arrow-bg-filled.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden="true"
    />
  );
}
