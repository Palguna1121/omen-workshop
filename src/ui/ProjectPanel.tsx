import { useGameStore } from "@/store/gameStore";
import { stations } from "@/game/config";
import { Dialog } from "./Dialog";
import { PortfolioContent } from "./PortfolioContent";

export function ProjectPanel() {
  const section = useGameStore((s) => s.section);
  if (!section) return null;
  const station = stations.find((station) => station.id === section)!;
  return (
    <Dialog
      title={station.title}
      subtitle={station.object}
      onClose={() => useGameStore.getState().closeSection()}
    >
      <PortfolioContent section={section} />
    </Dialog>
  );
}
