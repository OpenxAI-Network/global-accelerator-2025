import "@/app/globals.css";

export const metadata = {
  title: "Chat",
  description: "Chat page",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
