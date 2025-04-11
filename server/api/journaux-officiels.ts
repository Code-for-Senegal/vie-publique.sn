import { defineEventHandler, getQuery } from "h3";
import { serverQueryContent } from "#content/server";
// DEPRECATED - to delete
export default defineEventHandler(async (event) => {
  const { page = 1, limit = 10, search = "" } = getQuery(event);

  console.log("Query params:", { page, limit, search });

  let query = serverQueryContent(event, "journal-officiel-senegal");

  const totalBeforeFilter = await query.count();
  console.log("Total documents before filtering:", totalBeforeFilter);

  if (search) {
    query = query.where({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { numero: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
      ],
    });
  }

  const total = await query.count();
  console.log("Total after filtering:", total);

  const journaux = await query
    .sort({ _path: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .find();

  console.log("Journaux found:", journaux.length);

  return {
    journaux,
    total,
    page: +page,
    limit: +limit,
  };
});
