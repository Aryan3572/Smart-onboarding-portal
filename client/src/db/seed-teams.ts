import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const companies = await prisma.company.findMany();

	for (const company of companies) {
		const teams = ["Tech", "Operations", "Support", "HR", "Sales"];

		for (const teamName of teams) {
			await prisma.team.upsert({
				where: {
					name_companyId: {
						name: teamName,
						companyId: company.id,
					},
				},
				update: {},
				create: {
					name: teamName,
					companyId: company.id,
				},
			});
		}

		console.log(`✅ Teams ready for company: ${company.name}`);
	}
}

main()
	.then(async () => {
		console.log("🌱 Teams seeding completed");
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("❌ Error while seeding teams:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
