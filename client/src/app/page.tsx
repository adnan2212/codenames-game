import GameBoard from "@/components/game/GameBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Codenames
        </h1>

        <GameBoard />
      </div>
    </main>
  );
}