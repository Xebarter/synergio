import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/withAuth";
import { prisma } from "@/lib/prisma";
import { OrderData, paginationSchema } from "@/types/api";
import { getOrders, createOrder } from "@/lib/api/orders";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) {
  try {
    if (req.method === "GET") {
      // Parse and validate pagination query parameters
      const query = paginationSchema.parse({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any,
        customerId: req.query.customerId as string,
      });

      const { customerId, ...pagination } = query;
      
      const result = await getOrders({
        userId: user.id,
        customerId,
        pagination,
      });

      return res.status(200).json({ success: true, ...result });
    }

    if (req.method === "POST") {
      // Validate request body
      const data: OrderData = req.body;
      
      // Validate required fields
      if (!data.customerId || !data.items || data.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Customer ID and at least one order item are required",
        });
      }

      // Validate each order item
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            success: false,
            error: `Item ${i + 1}: Product ID and quantity (greater than 0) are required`,
          });
        }
      }

      const order = await createOrder(data, user.id);
      return res.status(201).json({ success: true, data: order });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error: any) {
    console.error("Orders API Error:", error);
    
    // Handle stock issues specifically
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.cause || [],
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});
