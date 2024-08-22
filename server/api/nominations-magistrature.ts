import magistratureMembers from "~/assets/data/nominations-magistrature.json";
import { MagistratureType } from "~/types/magistrature-type";

export default defineEventHandler((): MagistratureType[] => {
  return magistratureMembers.sort(
    (a, b) =>
      new Date(b.date_nomination).getTime() -
      new Date(a.date_nomination).getTime()
  );
});
