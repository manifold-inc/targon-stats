export default function BackgroundSVG() {
  return (
    <div
      className="fixed inset-0 -z-10 h-screen w-screen opacity-50"
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
