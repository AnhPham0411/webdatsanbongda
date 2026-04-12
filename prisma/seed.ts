import {
  PrismaClient,
  BookingStatus,
  PaymentStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu cho Sport Arena...')

  const tx = prisma as any;

  await tx.Review.deleteMany().catch(() => { });
  await tx.Payment.deleteMany().catch(() => { });
  await tx.BookingExtraService.deleteMany().catch(() => { });
  await tx.Booking.deleteMany().catch(() => { });
  await tx.SeasonalPrice.deleteMany().catch(() => { });
  await tx.CourtImage.deleteMany().catch(() => { });
  await tx.Wishlist.deleteMany().catch(() => { });
  await tx.Court.deleteMany().catch(() => { });
  await tx.TimeSlot.deleteMany().catch(() => { });
  await tx.CourtType.deleteMany().catch(() => { });
  await tx.Location.deleteMany().catch(() => { });
  await tx.ExtraService.deleteMany().catch(() => {});
  await tx.Account.deleteMany().catch(() => { });
  await tx.User.deleteMany().catch(() => { });
  await tx.Amenity.deleteMany().catch(() => { });
  await tx.Sport.deleteMany().catch(() => { });

  console.log('🧹 Hệ thống đã sẵn sàng.');

  const hashedPassword = await bcrypt.hash('123456', 10);

  await tx.User.create({
    data: {
      email: 'admin@sportarena.com',
      name: 'Admin Hệ Thống',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '0909999999',
      emailVerified: new Date(),
    },
  });

  await tx.User.create({
    data: {
      email: 'danggiahung712@gmail.com',
      name: 'Hùng Dân',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '0988776655',
      emailVerified: new Date(),
    },
  });

  await tx.User.create({
    data: {
      email: 'staff@sportarena.com',
      name: 'Nhân viên chuyên môn',
      password: hashedPassword,
      role: 'STAFF',
      phone: '0911111111',
      emailVerified: new Date(),
    },
  });

  const user = await tx.User.create({
    data: {
      email: 'khachhang@gmail.com',
      name: 'Nguyễn Văn An',
      password: hashedPassword,
      role: 'USER',
      phone: '0912345678',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Đã tạo Users!');

  const footballSport = await tx.Sport.create({
    data: { name: 'Bóng đá', description: 'Hệ thống sân cỏ nhân tạo đạt chuẩn FIFA.' }
  });

  const amenities = [
    { name: 'Áo Pitch', icon: 'shirt' },
    { name: 'Nước uống', icon: 'coffee' },
    { name: 'Thuê bóng', icon: 'circle' },
    { name: 'Phòng thay đồ', icon: 'door' },
  ];

  for (const am of amenities) {
    await tx.Amenity.create({ data: am });
  }

  const timeSlots = await Promise.all([
    tx.TimeSlot.create({ data: { startTime: new Date("1970-01-01T16:00:00Z"), endTime: new Date("1970-01-01T17:30:00Z") } }),
    tx.TimeSlot.create({ data: { startTime: new Date("1970-01-01T17:30:00Z"), endTime: new Date("1970-01-01T19:00:00Z") } }),
    tx.TimeSlot.create({ data: { startTime: new Date("1970-01-01T19:00:00Z"), endTime: new Date("1970-01-01T20:30:00Z") } }),
    tx.TimeSlot.create({ data: { startTime: new Date("1970-01-01T20:30:00Z"), endTime: new Date("1970-01-01T22:00:00Z") } }),
  ]);

  const imageList = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1526232761682-d26e4f9c5b4b?auto=format&fit=crop&q=80&w=1000'
  ];

  const locationsData = [
    { name: 'Sân bóng Thành Đô', district: 'Cầu Giấy', address: 'Số 1 Cầu Giấy, Hà Nội', img: imageList[0] },
    { name: 'Sân bóng Thủy Lợi', district: 'Đống Đa', address: 'Ngõ 95 Chùa Bộc, Hà Nội', img: imageList[1] },
    { name: 'Sân bóng VSA', district: 'Thanh Xuân', address: 'Lê Trọng Tấn, Hà Nội', img: imageList[2] },
    { name: 'Sân bóng Bách Khoa', district: 'Đống Đa', address: 'Trần Đại Nghĩa, Hà Nội', img: imageList[3] },
    { name: 'Sân bóng Mỹ Đình', district: 'Hà Đông', address: 'Lê Đức Thọ, Hà Nội', img: imageList[4] },
  ];

  const locs = [];
  for (const loc of locationsData) {
    const createdLoc = await tx.Location.create({
      data: {
        name: loc.name,
        district: loc.district,
        address: loc.address,
        description: 'Cụm sân cỏ nhân tạo đạt tiêu chuẩn chất lượng cao, hệ thống chiếu sáng hiện đại.',
        imageUrl: loc.img,
        updatedAt: new Date(),
      }
    });
    locs.push(createdLoc);
  }

  const courtsList = [];
  for (let i = 0; i < 5; i++) {
    const courtType = await tx.CourtType.create({
      data: {
        name: `Sân 7 người tiêu chuẩn`,
        description: 'Mặt cỏ nhân tạo chất lượng, thoát nước tốt, phù hợp mọi điều kiện thời tiết.',
        basePrice: 500000 + (Math.floor(Math.random() * 3) * 100000),
        capacity: 14,
        locationId: locs[i].id,
        sportId: footballSport.id,
      }
    });

    const court = await tx.Court.create({
      data: {
        name: `${locs[i].name} - Sân chính`,
        courtTypeId: courtType.id,
        isAvailable: true,
      }
    });
    courtsList.push(court);
  }

  await tx.ExtraService.createMany({
    data: [
      { name: 'Thuê áo Pitch', price: 50000, icon: 'shirt' },
      { name: 'Nước suối giải khát', price: 15000, icon: 'droplet' },
      { name: 'Thuê bóng thi đấu', price: 20000, icon: 'circle' },
    ]
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
  const paymentStatuses = ['UNPAID', 'UNPAID', 'PAID', 'PAID', 'REFUNDED'];
  const guestNames = ['Nguyễn Văn An', 'Trần Minh Quân', 'Lê Văn Cường', 'Phạm Anh Tuấn', 'Hoàng Việt Hoàng'];
  
  for (let i = 0; i < 5; i++) {
    const bDate = new Date(today);
    bDate.setDate(today.getDate() - i); 
    bDate.setHours(16 + i, 0, 0, 0); 

    const court = courtsList[i];
    const timeSlot = timeSlots[i % 4];

    const ct = await tx.CourtType.findUnique({ where: { id: court.courtTypeId } });
    const basePrice = Number(ct.basePrice);

    const booking = await tx.Booking.create({
      data: {
        userId: user.id,
        courtId: court.id,
        timeSlotId: timeSlot.id,
        date: bDate,
        status: bookingStatuses[i],
        paymentStatus: paymentStatuses[i],
        totalPrice: Number(basePrice),
        depositAmount: Number(basePrice * 0.3),
        guestName: guestNames[i],
        guestPhone: '0912345678',
        guestEmail: 'khachhang@gmail.com',
        createdAt: bDate,
      }
    });

    await tx.Payment.create({
      data: {
        bookingId: booking.id,
        amount: basePrice,
        provider: 'CASH_AT_COUNTER',
        status: paymentStatuses[i] === 'UNPAID' ? 'UNPAID' : 'PAID',
        transactionCode: `TRX-ARENA-${i}`,
      }
    });

    if (i % 2 === 0) {
      await tx.Review.create({
        data: {
          rating: 5,
          comment: 'Sân rất đẹp, mặt cỏ tốt, nhân viên nhiệt tình.',
          userId: user.id,
          courtId: court.id,
          createdAt: bDate
        }
      });
    }
  }

  console.log('🏁 Khởi tạo dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })