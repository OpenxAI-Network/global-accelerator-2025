import Header from "@/components/Header";

export default function Discover() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Discover</h1>
          <p className="text-lg text-muted-foreground">
            Trending Matcha Spots will go here
          </p>
        </div>
      </div>
    </div>
  );
}
