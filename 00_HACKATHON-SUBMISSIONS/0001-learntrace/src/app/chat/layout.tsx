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
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
