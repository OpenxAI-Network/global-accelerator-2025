import "@/app/globals.css";

export const metadata = {
  title: "Graph",
  description: "Graph page",
};

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}
