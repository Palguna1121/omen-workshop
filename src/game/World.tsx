import { stations } from "./config";
import { Interactable } from "./interaction/Interactable";
import { Atmosphere } from "./world/Atmosphere";
import { Garage } from "./world/Garage";
import { Grounds } from "./world/Grounds";
import { Hotspots } from "./world/Hotspots";
import { House } from "./world/House";
import { Interior } from "./world/Interior";
import { Portal } from "./world/Portal";
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
      <Vegetation />
      <Hotspots />
      {stations.map((station) => (
        <Interactable key={station.id} station={station} />
      ))}
    </>
  );
}
