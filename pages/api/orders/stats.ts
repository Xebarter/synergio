import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/withAuth";
import { getOrderStats } from "@/lib/api/orders";

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
    const { period = 'month' } = req.query;
    const validPeriods = ['day', 'week', 'month', 'year'];
    
    if (typeof period !== 'string' || !validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        error: `Invalid period. Must be one of: ${validPeriods.join(', ')}`,
      });
    }

    const stats = await getOrderStats(user.id, period as any);
    return res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching order stats:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch order statistics",
    });
  }
});
