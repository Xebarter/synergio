import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/withAuth";
import { prisma } from "@/lib/prisma";
import { getOrderById, updateOrderStatus, cancelOrder } from "@/lib/api/orders";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const order = await getOrderById(id as string, user.id);
      
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      return res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      console.error("Error fetching order:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      let updatedOrder;
      
      if (status === "CANCELLED") {
        updatedOrder = await cancelOrder(id as string, user.id);
      } else {
        updatedOrder = await updateOrderStatus(id as string, status, user.id);
      }

      return res.status(200).json({ success: true, data: updatedOrder });
    } catch (error: any) {
      console.error("Error updating order:", error);
      return res.status(400).json({ 
        success: false, 
        error: error.message || "Failed to update order" 
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Verify the order exists and belongs to the user
      const order = await prisma.order.findFirst({
        where: { id: id as string, userId: user.id },
      });

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: "Order not found" 
        });
      }

      // Only allow deletion of pending or cancelled orders
      if (!["PENDING", "CANCELLED"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: "Only pending or cancelled orders can be deleted",
        });
      }

      // Delete the order (cascading deletes order items)
      await prisma.order.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error deleting order:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to delete order" 
      });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ success: false, error: "Method not allowed" });
});
