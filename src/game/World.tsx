import { House } from "./world/House";
import { Garage } from "./world/Garage";
import { Portal } from "./world/Portal";
import { stations } from "./config";
import { Interactable } from "./interaction/Interactable";
import { LabEquipment } from "./world/LabEquipment";
import { WorkshopDetails } from "./world/WorkshopDetails";

export function World() {
  return (
    <>
      <House />
      <Garage />
      <LabEquipment />
      <WorkshopDetails />
      <Portal />
      {stations.map((station) => (
        <Interactable key={station.id} station={station} />
      ))}
    </>
  );
}
