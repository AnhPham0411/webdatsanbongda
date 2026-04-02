// prisma/seed.ts
import { PrismaClient, UserRole, BookingStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu cho Ha Long Stay...')

  // =========================================================================
  // 1. DỌN DẸP DỮ LIỆU CŨ
  // =========================================================================
  // Xóa theo thứ tự con trước cha để tránh lỗi khóa ngoại
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.seasonalPrice.deleteMany()
  await prisma.roomImage.deleteMany()
  await prisma.room.deleteMany()
  await prisma.roomType.deleteMany()
  await prisma.location.deleteMany() // <--- MỚI: Xóa location
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.amenity.deleteMany()

  console.log('🗑️  Đã dọn dẹp database cũ.')

  // =========================================================================
  // 2. TẠO USER (ADMIN, STAFF, CUSTOMER)
  // =========================================================================
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 2.1 Admin (Chủ chuỗi)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@halongstay.com',
      name: 'CEO Phạm Tuấn Anh',
      password: hashedPassword,
      role: UserRole.ADMIN,
      phone: '0909999999',
      image: 'https://avatar.iran.liara.run/public/job/doctor/male',
      emailVerified: new Date(),
    },
  })

  // 2.2 Staff (Lễ tân)
  await prisma.user.create({
    data: {
      email: 'staff@halongstay.com',
      name: 'Lễ Tân - Sun World',
      password: hashedPassword,
      role: UserRole.STAFF,
      phone: '0908888888',
      image: 'https://avatar.iran.liara.run/public/job/operator/female',
      emailVerified: new Date(),
    },
  })

  // 2.3 Khách hàng VIP
  const user1 = await prisma.user.create({
    data: {
      email: 'khachvip@gmail.com',
      name: 'Nguyễn Thái Học',
      password: hashedPassword,
      role: UserRole.USER,
      phone: '0912345678',
      image: 'https://avatar.iran.liara.run/public/boy',
      emailVerified: new Date(),
    },
  })

  // 2.4 Khách hàng vãng lai
  const user2 = await prisma.user.create({
    data: {
      email: 'khachdulich@gmail.com',
      name: 'Trần Thu Hà',
      password: hashedPassword,
      role: UserRole.USER,
      phone: '0987654321',
      image: 'https://avatar.iran.liara.run/public/girl',
    },
  })

  console.log('✅ Đã tạo Users')

  // =========================================================================
  // 3. TẠO TIỆN NGHI (AMENITIES)
  // =========================================================================
  const amenityList = [
    { name: 'Wifi miễn phí', icon: 'wifi' }, // 0
    { name: 'Điều hòa', icon: 'wind' }, // 1
    { name: 'View biển', icon: 'sun' }, // 2
    { name: 'Bồn tắm', icon: 'bath' }, // 3
    { name: 'Bữa sáng', icon: 'coffee' }, // 4
    { name: 'Hồ bơi vô cực', icon: 'waves' }, // 5
    { name: 'Chèo Kayak', icon: 'anchor' }, // 6
    { name: 'Đưa đón sân bay', icon: 'car' }, // 7
    { name: 'Spa & Massage', icon: 'heart' }, // 8
    { name: 'Minibar', icon: 'wine' }, // 9
  ]

  const savedAmenities: any[] = []
  for (const item of amenityList) {
    const am = await prisma.amenity.create({ data: item })
    savedAmenities.push(am)
  }
  console.log('✅ Đã tạo Amenities')

  // Helper lấy tiện nghi theo index
  const getAms = (indices: number[]) => indices.map(i => ({ id: savedAmenities[i].id }))

  // =========================================================================
  // 4. TẠO LOCATION (CHI NHÁNH/KHÁCH SẠN) - <--- PHẦN MỚI
  // =========================================================================
  
  const locPearl = await prisma.location.create({
    data: {
        name: 'Ha Long Pearl Hotel',
        address: '123 Đường Bãi Cháy, TP. Hạ Long',
        description: 'Khách sạn tiêu chuẩn 4 sao nằm ngay trung tâm du lịch.',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800'
    }
  })

  const locSun = await prisma.location.create({
    data: {
        name: 'Sun World Resort',
        address: 'Đảo Rều, Bãi Cháy',
        description: 'Khu nghỉ dưỡng cao cấp biệt lập, không gian riêng tư.',
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800'
    }
  })

  const locCruise = await prisma.location.create({
    data: {
        name: 'Paradise Elegance Cruise',
        address: 'Cảng Tuần Châu',
        description: 'Du thuyền 5 sao đẳng cấp thăm vịnh Hạ Long.',
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800'
    }
  })

  console.log('✅ Đã tạo Locations')


  // =========================================================================
  // 5. TẠO LOẠI PHÒNG (ROOM TYPES) - LIÊN KẾT VỚI LOCATION
  // =========================================================================

  // --- KHÁCH SẠN 1: HA LONG PEARL ---
  const pearlDeluxe = await prisma.roomType.create({
    data: {
      locationId: locPearl.id, // <--- Thay hotelName bằng locationId
      name: 'Deluxe City View',
      description: 'Phòng tiêu chuẩn nằm ngay trung tâm Bãi Cháy, thuận tiện đi lại, view phố lung linh về đêm.',
      basePrice: 1200000,
      capacity: 2,
      amenities: { connect: getAms([0, 1, 4, 9]) },
    },
  })

  const pearlSuite = await prisma.roomType.create({
    data: {
      locationId: locPearl.id,
      name: 'Executive Suite Ocean',
      description: 'Căn hộ cao cấp với ban công hướng thẳng ra Vịnh, thích hợp cho các cặp đôi.',
      basePrice: 2500000,
      capacity: 2,
      amenities: { connect: getAms([0, 1, 2, 3, 4, 9]) },
    },
  })

  // --- KHÁCH SẠN 2: SUN WORLD ---
  const sunBungalow = await prisma.roomType.create({
    data: {
      locationId: locSun.id,
      name: 'Beachfront Bungalow',
      description: 'Nhà gỗ nằm sát bãi biển nhân tạo, không gian riêng tư, yên tĩnh.',
      basePrice: 3500000,
      capacity: 2,
      amenities: { connect: getAms([0, 1, 2, 5, 8, 9]) },
    },
  })

  const sunVilla = await prisma.roomType.create({
    data: {
      locationId: locSun.id,
      name: 'Royal Villa 3BR',
      description: 'Biệt thự 3 phòng ngủ có hồ bơi riêng, dành cho đại gia đình.',
      basePrice: 8500000,
      capacity: 6,
      amenities: { connect: getAms([0, 1, 2, 3, 4, 5, 7, 8, 9]) },
    },
  })

  // --- KHÁCH SẠN 3: DU THUYỀN ---
  const cruiseCabin = await prisma.roomType.create({
    data: {
      locationId: locCruise.id,
      name: 'Junior Balcony Cabin',
      description: 'Trải nghiệm ngủ đêm trên Vịnh Hạ Long, cabin có ban công riêng ngắm bình minh.',
      basePrice: 4800000,
      capacity: 2,
      amenities: { connect: getAms([0, 1, 2, 4, 6, 9]) },
    },
  })

  console.log('✅ Đã tạo RoomTypes')

  // =========================================================================
  // 6. TẠO PHÒNG (ROOMS) & ẢNH
  // =========================================================================

  // Cập nhật hàm createRooms để nhận thêm hotelName cho AltText (vì RoomType không chứa hotelName string nữa)
  const createRooms = async (type: any, hotelName: string, prefix: string, count: number, images: string[]) => {
    for (let i = 1; i <= count; i++) {
      await prisma.room.create({
        data: {
          name: `${prefix}-${i < 10 ? '0' + i : i}`, // VD: P-01, V-02
          roomTypeId: type.id,
          isAvailable: true,
          images: {
            create: images.map((url, idx) => ({
              url: url,
              altText: `${hotelName} - ${type.name} - Img ${idx + 1}`
            }))
          }
        }
      })
    }
  }

  // Tạo phòng Pearl Hotel
  await createRooms(pearlDeluxe, locPearl.name, 'P', 5, [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-f33fb0d41388?q=80&w=800&auto=format&fit=crop'
  ])
  await createRooms(pearlSuite, locPearl.name, 'PS', 3, [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop'
  ])

  // Tạo phòng Sun World
  await createRooms(sunBungalow, locSun.name, 'BG', 4, [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573676046477-b1b112fa163b?q=80&w=800&auto=format&fit=crop'
  ])
  await createRooms(sunVilla, locSun.name, 'VILLA', 2, [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop'
  ])

  // Tạo phòng Du thuyền
  await createRooms(cruiseCabin, locCruise.name, 'CABIN', 6, [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605283176568-9b4e85eb79c9?q=80&w=800&auto=format&fit=crop'
  ])

  console.log('✅ Đã tạo Rooms & Images')

  // =========================================================================
  // 7. TẠO DỮ LIỆU ĐẶT PHÒNG (BOOKINGS) & DOANH THU
  // =========================================================================

  // Lấy vài phòng mẫu
  const rPearl = await prisma.room.findFirst({ where: { roomTypeId: pearlSuite.id } })
  const rSun = await prisma.room.findFirst({ where: { roomTypeId: sunBungalow.id } })
  const rCruise = await prisma.room.findFirst({ where: { roomTypeId: cruiseCabin.id } })

  if (rPearl && rSun && rCruise) {
    // 1. Đơn hoàn thành
    await prisma.booking.create({
      data: {
        userId: user1.id,
        roomId: rPearl.id,
        checkIn: new Date('2024-03-10'),
        checkOut: new Date('2024-03-12'),
        totalPrice: 5000000,
        status: BookingStatus.CHECKED_OUT,
        paymentStatus: PaymentStatus.PAID,
        guestName: user1.name,
        payment: {
          create: {
            amount: 5000000,
            provider: 'VNPAY',
            status: PaymentStatus.PAID,
            transactionCode: 'VNP_001'
          }
        },
        review: {
          create: {
            userId: user1.id,
            rating: 5,
            comment: 'Phòng Pearl view đẹp xuất sắc, nhân viên nhiệt tình!'
          }
        }
      }
    })

    // 2. Đơn đang ở
    await prisma.booking.create({
      data: {
        userId: user2.id,
        roomId: rSun.id,
        checkIn: new Date(),
        checkOut: new Date(new Date().setDate(new Date().getDate() + 2)),
        totalPrice: 7000000,
        status: BookingStatus.CHECKED_IN,
        paymentStatus: PaymentStatus.PAID,
        guestName: 'Gia đình chị Hà',
        payment: {
          create: {
            amount: 7000000,
            provider: 'CASH',
            status: PaymentStatus.PAID,
            transactionCode: 'CASH_002'
          }
        }
      }
    })

    // 3. Đơn sắp tới
    await prisma.booking.create({
      data: {
        userId: user1.id,
        roomId: rCruise.id,
        checkIn: new Date(new Date().setDate(new Date().getDate() + 7)),
        checkOut: new Date(new Date().setDate(new Date().getDate() + 8)),
        totalPrice: 4800000,
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        guestName: 'Nguyễn Thái Học',
        note: 'Kỷ niệm ngày cưới, setup giúp tôi ít hoa.',
        payment: {
          create: {
            amount: 4800000,
            provider: 'BANK_TRANSFER',
            status: PaymentStatus.PAID,
            transactionCode: 'BANK_003'
          }
        }
      }
    })
  }

  console.log('✅ Đã tạo Bookings (Doanh thu & Reviews)')
  console.log('🏁 HA LONG STAY DATABASE READY!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })