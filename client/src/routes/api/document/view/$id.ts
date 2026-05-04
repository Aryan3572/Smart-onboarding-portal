import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const uploadDir = path.join(process.cwd(), "public", "uploads");

const contentTypes: Record<string, string> = {
	".pdf": "application/pdf",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".txt": "text/plain; charset=utf-8",
	".csv": "text/csv; charset=utf-8",
};

function getContentType(fileName: string) {
	return (
		contentTypes[path.extname(fileName).toLowerCase()] ||
		"application/octet-stream"
	);
}

function safeUploadPath(fileUrl: string) {
	if (!fileUrl.startsWith("/uploads/")) return null;

	const filePath = path.resolve(uploadDir, path.basename(fileUrl));
	const uploadRoot = path.resolve(uploadDir);

	return filePath.startsWith(uploadRoot) ? filePath : null;
}

function dispositionFileName(fileName: string) {
	return fileName.replace(/["\r\n]/g, "_");
}

type AuthToken = {
	userId: string;
	companyId: string;
	role: string;
};

export const Route = createFileRoute("/api/document/view/$id")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				try {
					const cookie = request.headers.get("cookie") || "";
					const token = cookie
						.split("; ")
						.find((c) => c.startsWith("token="))
						?.split("=")[1];

					if (!token) return new Response("Unauthorized", { status: 401 });

					const decoded = verifyToken(token) as AuthToken;

					const document = await prisma.document.findUnique({
						where: { id: params.id },
						include: {
							employee: {
								select: {
									companyId: true,
									userId: true,
								},
							},
						},
					});

					if (
						!document ||
						document.employee.companyId !== decoded.companyId ||
						(decoded.role !== "hr" &&
							document.employee.userId !== decoded.userId)
					) {
						return new Response("Not found", { status: 404 });
					}

					const filePath = safeUploadPath(document.fileUrl);
					if (!filePath) return new Response("File not found", { status: 404 });

					const fileStats = await stat(filePath);
					const stream = Readable.toWeb(createReadStream(filePath));

					return new Response(stream as BodyInit, {
						headers: {
							"Content-Type": getContentType(document.fileName),
							"Content-Length": String(fileStats.size),
							"Content-Disposition": `inline; filename="${dispositionFileName(
								document.fileName,
							)}"`,
							"X-Content-Type-Options": "nosniff",
						},
					});
				} catch (err) {
					console.error("DOCUMENT VIEW ERROR:", err);
					return new Response("Error", { status: 500 });
				}
			},
		},
	},
});
