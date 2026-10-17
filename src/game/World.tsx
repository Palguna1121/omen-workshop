import { spots } from "./config";
import { Interactable } from "./interaction/Interactable";
import { Atmosphere } from "./world/Atmosphere";
import { Garage } from "./world/Garage";
import { Grounds } from "./world/Grounds";
import { Hotspots } from "./world/Hotspots";
import { House } from "./world/House";
import { Interior } from "./world/Interior";
import { Portal, RoofPortal } from "./world/Portal";
import { Creatures } from "./world/Creatures";
import { Crystals } from "./world/Crystals";
import { Interactive } from "./world/Interactive";
import { Scenery } from "./world/Scenery";
import { Vegetation } from "./world/Vegetation";

export function World() {
  return (
    <>
      <Atmosphere />
      <Scenery />
      <Grounds />
      <House />
      <Garage />
      <Interior />
      <Portal />
      <RoofPortal />
      <Interactive />
      <Crystals />
      <Creatures />
      <Vegetation />
      <Hotspots />
      {spots.map((spot) => (
        <Interactable key={spot.id} spot={spot} />
      ))}
    </>
  );
}
