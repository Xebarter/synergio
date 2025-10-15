import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/withAuth";
import { prisma } from "@/lib/prisma";
import { CustomerData, paginationSchema } from "@/types/api";
import { getCustomers, createCustomer } from "@/lib/api/customers";

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
      });

      const result = await getCustomers({
        userId: user.id,
        pagination: query,
      });

      return res.status(200).json({ success: true, ...result });
    }

    if (req.method === "POST") {
      // Validate request body
      const data: CustomerData = req.body;
      
      // Check if customer with the same email already exists
      if (data.email) {
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            email: data.email,
            userId: user.id,
          },
        });

        if (existingCustomer) {
          return res.status(400).json({
            success: false,
            error: "A customer with this email already exists",
          });
        }
      }

      const customer = await createCustomer(data, user.id);
      return res.status(201).json({ success: true, data: customer });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});
