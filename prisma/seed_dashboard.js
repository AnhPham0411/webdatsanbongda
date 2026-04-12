const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding extra services...");

  const services = [
    { name: "Thuê áo Pitch", price: 50000, icon: "Shirt" },
    { name: "Nước đá", price: 50000, icon: "Ice" },
    { name: "Thuê bóng", price: 30000, icon: "Ball" },
  ];

  for (const s of services) {
    const existing = await prisma.extraservice.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.extraservice.create({ data: { name: s.name, price: s.price, icon: s.icon } });
      console.log(`Created service: ${s.name}`);
    } else {
      await prisma.extraservice.update({
        where: { id: existing.id },
        data: { price: s.price, icon: s.icon }
      });
      console.log(`Updated service: ${s.name}`);
    }
  }

  console.log("Populating districts for locations...");
  const locations = await prisma.location.findMany();

  const hanoiDistricts = [
    "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Sóc Sơn", "Đông Anh", "Gia Lâm", "Nam Từ Liêm", "Bắc Từ Liêm", "Thanh Trì", "Mê Linh", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ", "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ", "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
  ];

  for (const loc of locations) {
    if (loc.address && !loc.district) {
      let foundDistrict = "Khác";
      for (const d of hanoiDistricts) {
        if (loc.address.toLowerCase().includes(d.toLowerCase())) {
          foundDistrict = d;
          break;
        }
      }
      await prisma.location.update({
        where: { id: loc.id },
        data: { district: foundDistrict }
      });
      console.log(`Updated location ${loc.name} with district ${foundDistrict}`);
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
