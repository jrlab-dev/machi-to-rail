export const VEHICLE_IDS=['nbox','scania','unic','sedan','van','work','aerial','marking'];
export const DEFAULT_VEHICLES=VEHICLE_IDS.slice(0,3);
export function selectedVehicles(value){return Array.isArray(value)?VEHICLE_IDS.filter(id=>value.includes(id)):DEFAULT_VEHICLES.slice();}
