import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/withAuth";
import { searchCustomers } from "@/lib/api/customers";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { q } = req.query;
    
    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const results = await searchCustomers(q, user.id);
    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});
