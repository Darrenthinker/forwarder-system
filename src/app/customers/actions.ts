"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CustomerSchema = z.object({
  name: z.string().min(1, "客户名称必填"),
  contact: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("邮箱格式错误").optional().or(z.literal("")),
  creditLimit: z.coerce.number().min(0).optional().nullable(),
  remark: z.string().optional().nullable(),
  customerType: z.enum(["COMPANY", "INDIVIDUAL"]).default("COMPANY"),
  sourceType: z.enum(["DIRECT", "PEER"]).default("DIRECT"),
  taxCode: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  priceRate: z.coerce.number().min(1).max(10).default(1.0),
  // 地址字段（可选）
  addr_province: z.string().optional().nullable(),
  addr_city: z.string().optional().nullable(),
  addr_address: z.string().optional().nullable(),
  addr_contact: z.string().optional().nullable(),
  addr_phone: z.string().optional().nullable(),
});

export type FormState = { error?: string; ok?: boolean };

export async function createCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = CustomerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "校验失败" };
  }
  const d = parsed.data;

  const hasAddress = d.addr_address?.trim();

  await prisma.customer.create({
    data: {
      name: d.name,
      contact: d.contact || null,
      phone: d.phone || null,
      email: d.email || null,
      creditLimit: d.creditLimit ?? 0,
      remark: d.remark || null,
      customerType: d.customerType,
      sourceType: d.sourceType,
      taxCode: d.taxCode || null,
      idNumber: d.idNumber || null,
      priceRate: d.priceRate,
      addresses: hasAddress
        ? {
            create: {
              label: "默认收货地址",
              province: d.addr_province || null,
              city: d.addr_city || null,
              address: d.addr_address!,
              contact: d.addr_contact || null,
              phone: d.addr_phone || null,
              isDefault: true,
            },
          }
        : undefined,
    },
  });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  const orders = await prisma.order.count({ where: { customerId: id } });
  if (orders > 0) {
    throw new Error("该客户有订单，不能删除");
  }
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}
