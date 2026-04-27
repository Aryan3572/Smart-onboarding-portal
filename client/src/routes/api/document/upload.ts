import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const maxFileSizeKb = 5120;

function cleanFileName(fileName: string) {
	return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function uploadPathFromUrl(fileUrl: string) {
	if (!fileUrl.startsWith("/uploads/")) return null;
	return path.join(uploadDir, path.basename(fileUrl));
}

export const Route = createFileRoute("/api/document/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const cookie = request.headers.get("cookie");

					const token = cookie
						?.split("; ")
						.find((c) => c.startsWith("token="))
						?.split("=")[1];

					if (!token) {
						return new Response("Unauthorized", { status: 401 });
					}

					const decoded: any = verifyToken(token);
					const formData = await request.formData();
					const file = formData.get("file") as File | null;
					const question = formData.get("question") as string | null;
					const checklistItemId = formData.get("checklistItemId") as string;

					if (!checklistItemId) {
						return new Response("Checklist item is required", { status: 400 });
					}

					const employee = await prisma.employee.findFirst({
						where: { userId: decoded.userId },
					});

					if (!employee) {
						return new Response("Employee not found", { status: 404 });
					}

					const checklistItem = await prisma.checklistItem.findFirst({
						where: {
							id: checklistItemId,
							checklist: {
								companyId: employee.companyId,
							},
						},
					});

					if (!checklistItem) {
						return new Response("Checklist item not found", { status: 404 });
					}

					let fileName = "Text submission";
					let fileUrl = "";
					let fileSizeKb: number | null = null;

					if (file?.size) {
						fileSizeKb = Math.max(1, Math.round(file.size / 1024));

						if (fileSizeKb > maxFileSizeKb) {
							return new Response(
								`File is too large. Maximum size is ${maxFileSizeKb} KB.`,
								{ status: 413 },
							);
						}

						await mkdir(uploadDir, { recursive: true });

						fileName = cleanFileName(file.name);
						const storedName = `${randomUUID()}-${fileName}`;
						const bytes = Buffer.from(await file.arrayBuffer());

						await writeFile(path.join(uploadDir, storedName), bytes);
						fileUrl = `/uploads/${storedName}`;
					}

					const previousDocuments = await prisma.document.findMany({
						where: {
							employeeId: employee.id,
							checklistItemId,
						},
						select: {
							id: true,
							fileUrl: true,
						},
					});

					await Promise.all(
						previousDocuments.map(async (doc) => {
							const localPath = uploadPathFromUrl(doc.fileUrl);
							if (!localPath) return;

							try {
								await unlink(localPath);
							} catch {
								// Missing files should not block replacing the latest upload.
							}
						}),
					);

					await prisma.document.deleteMany({
						where: {
							employeeId: employee.id,
							checklistItemId,
						},
					});

					const document = await prisma.document.create({
						data: {
							fileName,
							fileUrl,
							fileSizeKb,
							question: question?.trim() || null,
							employeeId: employee.id,
							checklistItemId,
						},
					});

					await prisma.employeeChecklist.upsert({
						where: {
							employeeId_checklistItemId: {
								employeeId: employee.id,
								checklistItemId,
							},
						},
						update: {
							completed: true,
							warning: null,
						},
						create: {
							employeeId: employee.id,
							checklistItemId,
							completed: true,
							warning: null,
						},
					});

					return new Response(JSON.stringify({ success: true, document }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (err) {
					console.error("UPLOAD ERROR:", err);
					return new Response("Error", { status: 500 });
				}
			},
		},
	},
});
