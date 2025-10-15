import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/withAuth";
import { prisma } from "@/lib/prisma";
import { CustomerData } from "@/types/api";
import { getCustomerById, updateCustomer, deleteCustomer } from "@/lib/api/customers";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const customer = await getCustomerById(id as string, user.id);
      
      if (!customer) {
        return res.status(404).json({ success: false, error: "Customer not found" });
      }

      return res.status(200).json({ success: true, data: customer });
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const data: CustomerData = req.body;
      
      // Check if customer exists and belongs to the user
      const existingCustomer = await prisma.customer.findFirst({
        where: { id: id as string, userId: user.id },
      });

      if (!existingCustomer) {
        return res.status(404).json({ success: false, error: "Customer not found" });
      }

      // Check if email is being updated and if it's already taken
      if (data.email && data.email !== existingCustomer.email) {
        const emailExists = await prisma.customer.findFirst({
          where: {
            email: data.email,
            userId: user.id,
            NOT: { id: id as string },
          },
        });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            error: "A customer with this email already exists",
          });
        }
      }

      const updatedCustomer = await updateCustomer(id as string, data, user.id);
      return res.status(200).json({ success: true, data: updatedCustomer });
    } catch (error: any) {
      console.error("Error updating customer:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await deleteCustomer(id as string, user.id);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to delete customer" 
      });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ success: false, error: "Method not allowed" });
});
