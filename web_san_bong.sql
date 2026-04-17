/*
Navicat MySQL Data Transfer

Source Server         : localhost:/3307
Source Server Version : 50505
Source Host           : localhost:3307
Source Database       : web_san_bong

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2026-04-17 21:43:27
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for `account`
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  KEY `Account_userId_fkey` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of account
-- ----------------------------

-- ----------------------------
-- Table structure for `amenity`
-- ----------------------------
DROP TABLE IF EXISTS `amenity`;
CREATE TABLE `amenity` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `icon` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of amenity
-- ----------------------------
INSERT INTO amenity VALUES ('cmnpux2e00005tklnlx4kakzn', 'Áo pitch', 'shirt');
INSERT INTO amenity VALUES ('cmnpux2e40006tklnjv8vwljq', 'Nước đá', 'coffee');
INSERT INTO amenity VALUES ('cmnpux2e60007tklnapmphkq4', 'Thuê bóng', 'circle');

-- ----------------------------
-- Table structure for `booking`
-- ----------------------------
DROP TABLE IF EXISTS `booking`;
CREATE TABLE `booking` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `totalPrice` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `paymentStatus` enum('UNPAID','PAID','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `note` varchar(191) DEFAULT NULL,
  `guestName` varchar(191) DEFAULT NULL,
  `guestEmail` varchar(191) DEFAULT NULL,
  `guestPhone` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `courtId` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `depositAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discountValue` decimal(10,2) NOT NULL DEFAULT 0.00,
  `originalPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `timeSlotId` varchar(191) NOT NULL,
  `voucherId` varchar(191) DEFAULT NULL,
  `billUploadedAt` datetime(3) DEFAULT NULL,
  `paymentBill` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Booking_userId_idx` (`userId`),
  KEY `Booking_courtId_date_timeSlotId_idx` (`courtId`,`date`,`timeSlotId`),
  KEY `Booking_voucherId_idx` (`voucherId`),
  KEY `Booking_timeSlotId_fkey` (`timeSlotId`),
  CONSTRAINT `Booking_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `court` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Booking_timeSlotId_fkey` FOREIGN KEY (`timeSlotId`) REFERENCES `timeslot` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Booking_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `voucher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of booking
-- ----------------------------
INSERT INTO booking VALUES ('cmnpux2fy0015tklnk0xxcc2k', 'cmnpux2dt0003tklngu3xs9p6', '700000.00', 'CANCELLED', 'UNPAID', null, 'Nguyễn Văn An', 'an@gmail.com', '0912345678', '2026-04-08 01:30:00.000', '2026-04-15 15:44:47.339', 'cmnpux2ew000ktklnmbq7dgkf', '2026-04-08', '210000.00', '0.00', '0.00', 'cmnpux2e80008tkln1wlihlhh', null, null, null);
INSERT INTO booking VALUES ('cmnpux2g8001btklnvuz12e5h', 'cmnpux2dt0003tklngu3xs9p6', '500000.00', 'CONFIRMED', 'UNPAID', null, 'Trần Minh Quân', 'binh@gmail.com', '0987654321', '2026-04-07 04:30:00.000', '2026-04-08 09:39:49.544', 'cmnpux2f5000otklnhzsze9ne', '2026-04-07', '150000.00', '0.00', '0.00', 'cmnpux2ea000atkln3bb8edx0', null, null, null);
INSERT INTO booking VALUES ('cmnpux2ge001ftklnnumorzsx', 'cmnpux2dt0003tklngu3xs9p6', '600000.00', 'CHECKED_IN', 'PAID', null, 'Lê Văn Cường', 'cuong@gmail.com', '0901234567', '2026-04-06 07:30:00.000', '2026-04-08 09:39:49.551', 'cmnpux2fb000stklnfrbl5mq1', '2026-04-06', '180000.00', '0.00', '0.00', 'cmnpux2ea0009tklnknxrnaif', null, null, null);
INSERT INTO booking VALUES ('cmnpux2gm001ltklnhbm02qb7', 'cmnpux2dt0003tklngu3xs9p6', '700000.00', 'CONFIRMED', 'PAID', null, 'Phạm Anh Tuấn', 'dung@gmail.com', '0934567890', '2026-04-05 10:30:00.000', '2026-04-11 15:06:53.411', 'cmnpux2fh000wtklnvq9yfqwj', '2026-04-05', '210000.00', '0.00', '0.00', 'cmnpux2ea000btklnavmbrmqi', null, null, null);
INSERT INTO booking VALUES ('cmnpux2gr001ptkln59napbx8', 'cmnpux2dt0003tklngu3xs9p6', '700000.00', 'CANCELLED', 'REFUNDED', null, 'Hoàng Việt Hoàng', 'em@gmail.com', '0977889900', '2026-04-04 13:30:00.000', '2026-04-08 09:39:49.564', 'cmnpux2fo0010tklna1pmhtqb', '2026-04-04', '210000.00', '0.00', '0.00', 'cmnpux2e80008tkln1wlihlhh', null, null, null);
INSERT INTO booking VALUES ('cmo0rc0gc0002wujrvujw7ntg', 'cmnpux2dn0001tklnnru30skk', '576000.00', 'PENDING', 'UNPAID', '', 'Hùng Dân', 'danggiahung712@gmail.com', '0987657897657', '2026-04-16 00:44:56.253', '2026-04-16 00:45:09.393', 'cmnpux2fh000wtklnvq9yfqwj', '2026-04-16', '172800.00', '0.00', '0.00', 'cmnpux2e80008tkln1wlihlhh', 'cmo08au8s0001y4lyh5uj96ld', '2026-04-16 00:45:09.391', '/uploads/bills/bill-cmo0rc0gc0002wujrvujw7ntg-1776300309385.jpg');
INSERT INTO booking VALUES ('cmo1l9w060002qtfjox4kqqq6', 'cmnpux2dn0001tklnnru30skk', '800000.00', 'PENDING', 'UNPAID', '', 'Hùng Dân', 'danggiahung712@gmail.com', '098765435678', '2026-04-16 14:43:05.651', '2026-04-16 14:43:05.651', 'cmnpux2ew000ktklnmbq7dgkf', '2026-04-16', '240000.00', '0.00', '0.00', 'cmnpux2ea000atkln3bb8edx0', null, null, null);

-- ----------------------------
-- Table structure for `bookingextraservice`
-- ----------------------------
DROP TABLE IF EXISTS `bookingextraservice`;
CREATE TABLE `bookingextraservice` (
  `id` varchar(191) NOT NULL,
  `bookingId` varchar(191) NOT NULL,
  `extraServiceId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `priceAtBooking` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bookingextraservice_bookingId_idx` (`bookingId`),
  KEY `bookingextraservice_extraServiceId_idx` (`extraServiceId`),
  CONSTRAINT `bookingextraservice_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookingextraservice_extraServiceId_fkey` FOREIGN KEY (`extraServiceId`) REFERENCES `extraservice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of bookingextraservice
-- ----------------------------
INSERT INTO bookingextraservice VALUES ('cmo0rc0hh0004wujrdcwypyor', 'cmo0rc0gc0002wujrvujw7ntg', 'cmnpux2fr0013tklnryurhmj8', '1', '20000.00');
INSERT INTO bookingextraservice VALUES ('cmo1l9w1p0004qtfjttn1cbm9', 'cmo1l9w060002qtfjox4kqqq6', 'cmnpux2fr0012tklnhex9pdy4', '1', '50000.00');
INSERT INTO bookingextraservice VALUES ('cmo1l9w1y0006qtfjacmul47l', 'cmo1l9w060002qtfjox4kqqq6', 'cmnpux2fr0011tkln44g8d60g', '1', '50000.00');

-- ----------------------------
-- Table structure for `court`
-- ----------------------------
DROP TABLE IF EXISTS `court`;
CREATE TABLE `court` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `courtTypeId` varchar(191) NOT NULL,
  `isAvailable` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Court_courtTypeId_idx` (`courtTypeId`),
  CONSTRAINT `Court_courtTypeId_fkey` FOREIGN KEY (`courtTypeId`) REFERENCES `courttype` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of court
-- ----------------------------
INSERT INTO court VALUES ('cmnpux2ew000ktklnmbq7dgkf', 'Sân bóng Thành Đô - Sân 1', 'cmnpux2et000itklnlx2cwl7l', '1', '2026-04-08 09:39:49.496');
INSERT INTO court VALUES ('cmnpux2f5000otklnhzsze9ne', 'Sân bóng Thủy Lợi - Sân 1', 'cmnpux2ez000mtklnb9m51xi7', '1', '2026-04-08 09:39:49.505');
INSERT INTO court VALUES ('cmnpux2fb000stklnfrbl5mq1', 'Sân bóng VSA - Sân 1', 'cmnpux2f8000qtklnawis6gda', '1', '2026-04-08 09:39:49.512');
INSERT INTO court VALUES ('cmnpux2fh000wtklnvq9yfqwj', 'Sân bóng Bách Khoa - Sân 1', 'cmnpux2fe000utkln1x7et5bg', '1', '2026-04-08 09:39:49.517');
INSERT INTO court VALUES ('cmnpux2fo0010tklna1pmhtqb', 'Sân bóng Mỹ Đình - Sân 1', 'cmnpux2fk000ytklnbhb9hlf1', '1', '2026-04-08 09:39:49.524');

-- ----------------------------
-- Table structure for `courtimage`
-- ----------------------------
DROP TABLE IF EXISTS `courtimage`;
CREATE TABLE `courtimage` (
  `id` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `altText` varchar(191) DEFAULT NULL,
  `courtId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CourtImage_courtId_idx` (`courtId`),
  CONSTRAINT `CourtImage_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `court` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of courtimage
-- ----------------------------

-- ----------------------------
-- Table structure for `courttype`
-- ----------------------------
DROP TABLE IF EXISTS `courttype`;
CREATE TABLE `courttype` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `basePrice` decimal(10,2) NOT NULL,
  `capacity` int(11) NOT NULL,
  `locationId` varchar(191) NOT NULL,
  `sportId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CourtType_locationId_fkey` (`locationId`),
  KEY `CourtType_sportId_fkey` (`sportId`),
  CONSTRAINT `CourtType_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CourtType_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `sport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of courttype
-- ----------------------------
INSERT INTO courttype VALUES ('cmnpux2et000itklnlx2cwl7l', 'Sân 7 người - Cầu Giấy', 'Sân 7 tiêu chuẩn thi đấu phong trào', '700000.00', '14', 'cmnpux2ee000ctklnxykpp29e', 'cmnpux2dv0004tklnjkyq6ghs');
INSERT INTO courttype VALUES ('cmnpux2ez000mtklnb9m51xi7', 'Sân 7 người - Đống Đa', 'Sân 7 tiêu chuẩn thi đấu phong trào', '500000.00', '14', 'cmnpux2eh000dtkln07ai0vqp', 'cmnpux2dv0004tklnjkyq6ghs');
INSERT INTO courttype VALUES ('cmnpux2f8000qtklnawis6gda', 'Sân 7 người - Thanh Xuân', 'Sân 7 tiêu chuẩn thi đấu phong trào', '600000.00', '14', 'cmnpux2ek000etklnyoip3aj8', 'cmnpux2dv0004tklnjkyq6ghs');
INSERT INTO courttype VALUES ('cmnpux2fe000utkln1x7et5bg', 'Sân 7 người - Đống Đa', 'Sân 7 tiêu chuẩn thi đấu phong trào', '700000.00', '14', 'cmnpux2en000ftkln4fk2imvd', 'cmnpux2dv0004tklnjkyq6ghs');
INSERT INTO courttype VALUES ('cmnpux2fk000ytklnbhb9hlf1', 'Sân 7 người - Hà Đông', 'Sân 7 tiêu chuẩn thi đấu phong trào', '700000.00', '14', 'cmnpux2eq000gtkln3k9ktaa3', 'cmnpux2dv0004tklnjkyq6ghs');

-- ----------------------------
-- Table structure for `extraservice`
-- ----------------------------
DROP TABLE IF EXISTS `extraservice`;
CREATE TABLE `extraservice` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of extraservice
-- ----------------------------
INSERT INTO extraservice VALUES ('cmnpux2fr0011tkln44g8d60g', 'Thuê áo Pitch', '50000.00', 'shirt', '1', '2026-04-08 09:39:49.527', '2026-04-08 09:39:49.527');
INSERT INTO extraservice VALUES ('cmnpux2fr0012tklnhex9pdy4', 'Nước đá', '50000.00', 'droplet', '1', '2026-04-08 09:39:49.527', '2026-04-08 09:39:49.527');
INSERT INTO extraservice VALUES ('cmnpux2fr0013tklnryurhmj8', 'Thuê bóng', '20000.00', 'circle', '1', '2026-04-08 09:39:49.527', '2026-04-08 09:39:49.527');

-- ----------------------------
-- Table structure for `inquiry`
-- ----------------------------
DROP TABLE IF EXISTS `inquiry`;
CREATE TABLE `inquiry` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `subject` varchar(191) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('NEW','REPLIED','ARCHIVED') NOT NULL DEFAULT 'NEW',
  `adminReply` text DEFAULT NULL,
  `repliedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of inquiry
-- ----------------------------
INSERT INTO inquiry VALUES ('cmnvw7lj9000dp9kitlksjn1o', 'Đặng Gia Hưng', 'hungyen20082008@gmail.com', '', '', 'dahgagw', 'NEW', null, null, '2026-04-12 15:02:37.509', '2026-04-12 15:02:37.509');

-- ----------------------------
-- Table structure for `location`
-- ----------------------------
DROP TABLE IF EXISTS `location`;
CREATE TABLE `location` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `district` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of location
-- ----------------------------
INSERT INTO location VALUES ('cmnpux2ee000ctklnxykpp29e', 'Sân bóng Thành Đô', 'Số 1 Cầu Giấy, Hà Nội', 'Cụm sân cỏ nhân tạo đạt tiêu chuẩn chất lượng cao.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000', '2026-04-08 09:39:49.478', '2026-04-08 09:39:49.477', 'Cầu Giấy');
INSERT INTO location VALUES ('cmnpux2eh000dtkln07ai0vqp', 'Sân bóng Thủy Lợi', 'Ngõ 95 Chùa Bộc, Hà Nội', 'Cụm sân cỏ nhân tạo đạt tiêu chuẩn chất lượng cao.', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1000', '2026-04-08 09:39:49.481', '2026-04-08 09:39:49.480', 'Đống Đa');
INSERT INTO location VALUES ('cmnpux2ek000etklnyoip3aj8', 'Sân bóng VSA', 'Lê Trọng Tấn, Hà Nội', 'Cụm sân cỏ nhân tạo đạt tiêu chuẩn chất lượng cao.', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1000', '2026-04-08 09:39:49.485', '2026-04-08 09:39:49.483', 'Thanh Xuân');
INSERT INTO location VALUES ('cmnpux2en000ftkln4fk2imvd', 'Sân bóng Bách Khoa', 'Trần Đại Nghĩa, Hà Nội', 'Cụm sân cỏ nhân tạo đạt tiêu chuẩn chất lượng cao.', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1000', '2026-04-08 09:39:49.488', '2026-04-08 09:39:49.486', 'Đống Đa');
INSERT INTO location VALUES ('cmnpux2eq000gtkln3k9ktaa3', 'Sân bóng Mỹ Đình', 'Lê Đức Thọ, Hà Nội', 'Cụm sân cỏ nhân tạo đạt tiêu chuẩn chất lượng cao.', 'https://images.unsplash.com/photo-1526232761682-d26e4f9c5b4b?auto=format&fit=crop&q=80&w=1000', '2026-04-08 09:39:49.490', '2026-04-08 09:39:49.489', 'Hà Đông');

-- ----------------------------
-- Table structure for `notification`
-- ----------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'INFO',
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `link` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `notification_userId_idx` (`userId`),
  CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of notification
-- ----------------------------
INSERT INTO notification VALUES ('cmo07z7rx000r3teqgauds7v8', 'cmnvvzobc0000p9kio9gxa5go', 'Sân bóng mới đã được thêm! ⚽', 'Chúng tôi vừa đưa vào hoạt động sân \"Sport\". Hãy trải nghiệm ngay!', 'NEWS', '0', '/search', '2026-04-15 15:43:06.526');
INSERT INTO notification VALUES ('cmo07z7sq000x3teqfilk620x', 'cmnpux2dq0002tklnu43trvzu', 'Sân bóng mới đã được thêm! ⚽', 'Chúng tôi vừa đưa vào hoạt động sân \"Sport\". Hãy trải nghiệm ngay!', 'NEWS', '0', '/search', '2026-04-15 15:43:06.528');
INSERT INTO notification VALUES ('cmo07z7sq000y3teq387jm44r', 'cmnpux2d80000tkln9jmi2eb1', 'Sân bóng mới đã được thêm! ⚽', 'Chúng tôi vừa đưa vào hoạt động sân \"Sport\". Hãy trải nghiệm ngay!', 'NEWS', '0', '/search', '2026-04-15 15:43:06.526');
INSERT INTO notification VALUES ('cmo07z7sq000z3teqachd1lwu', 'cmnpux2dn0001tklnnru30skk', 'Sân bóng mới đã được thêm! ⚽', 'Chúng tôi vừa đưa vào hoạt động sân \"Sport\". Hãy trải nghiệm ngay!', 'NEWS', '1', '/search', '2026-04-15 15:43:06.527');
INSERT INTO notification VALUES ('cmo07z7sq00103teq5rr805oy', 'cmnpux2dt0003tklngu3xs9p6', 'Sân bóng mới đã được thêm! ⚽', 'Chúng tôi vừa đưa vào hoạt động sân \"Sport\". Hãy trải nghiệm ngay!', 'NEWS', '0', '/search', '2026-04-15 15:43:06.527');
INSERT INTO notification VALUES ('cmo07z7sq00113teq8v1ce8f4', 'cmnvw0ib20001p9kiefcznpp3', 'Sân bóng mới đã được thêm! ⚽', 'Chúng tôi vừa đưa vào hoạt động sân \"Sport\". Hãy trải nghiệm ngay!', 'NEWS', '0', '/search', '2026-04-15 15:43:06.526');
INSERT INTO notification VALUES ('cmo08brrv0004y4lywjjzefcm', 'cmnvw0ib20001p9kiefcznpp3', 'Ưu đãi mới từ Sport Arena! ?', 'Tết đến xuân về, nhận ngay mã SPORT giảm 20% cho mọi đơn đặt sân.', 'VOUCHER', '0', '/search', '2026-04-15 15:52:52.314');
INSERT INTO notification VALUES ('cmo08brrv0005y4lynf9hgu4b', 'cmnpux2d80000tkln9jmi2eb1', 'Ưu đãi mới từ Sport Arena! ?', 'Tết đến xuân về, nhận ngay mã SPORT giảm 20% cho mọi đơn đặt sân.', 'VOUCHER', '0', '/search', '2026-04-15 15:52:52.314');
INSERT INTO notification VALUES ('cmo08brry0007y4lyj0yhudba', 'cmnpux2dn0001tklnnru30skk', 'Ưu đãi mới từ Sport Arena! ?', 'Tết đến xuân về, nhận ngay mã SPORT giảm 20% cho mọi đơn đặt sân.', 'VOUCHER', '1', '/search', '2026-04-15 15:52:52.314');
INSERT INTO notification VALUES ('cmo08brs10009y4lynz1xkcma', 'cmnpux2dt0003tklngu3xs9p6', 'Ưu đãi mới từ Sport Arena! ?', 'Tết đến xuân về, nhận ngay mã SPORT giảm 20% cho mọi đơn đặt sân.', 'VOUCHER', '0', '/search', '2026-04-15 15:52:52.314');
INSERT INTO notification VALUES ('cmo08brs1000by4lygwtw0xzy', 'cmnpux2dq0002tklnu43trvzu', 'Ưu đãi mới từ Sport Arena! ?', 'Tết đến xuân về, nhận ngay mã SPORT giảm 20% cho mọi đơn đặt sân.', 'VOUCHER', '0', '/search', '2026-04-15 15:52:52.317');
INSERT INTO notification VALUES ('cmo08brs4000dy4lykxe65c46', 'cmnvvzobc0000p9kio9gxa5go', 'Ưu đãi mới từ Sport Arena! ?', 'Tết đến xuân về, nhận ngay mã SPORT giảm 20% cho mọi đơn đặt sân.', 'VOUCHER', '0', '/search', '2026-04-15 15:52:52.315');
INSERT INTO notification VALUES ('cmo0rrmyy000awujr4qkmplf6', 'cmnvvzobc0000p9kio9gxa5go', 'Ưu đãi mới từ Sport Arena! ?', 'Bạn nhận được mã ưu đãi **SUMMER** giảm 50%. Có hiệu lực từ ngày 16/04/2026 đến 16/04/2026.', 'VOUCHER', '0', '/search', '2026-04-16 00:57:05.290');
INSERT INTO notification VALUES ('cmo0rrmzz000cwujr6lfqvuq9', 'cmnpux2d80000tkln9jmi2eb1', 'Ưu đãi mới từ Sport Arena! ?', 'Bạn nhận được mã ưu đãi **SUMMER** giảm 50%. Có hiệu lực từ ngày 16/04/2026 đến 16/04/2026.', 'VOUCHER', '0', '/search', '2026-04-16 00:57:05.291');
INSERT INTO notification VALUES ('cmo0rrn00000hwujrid1ap5cb', 'cmnpux2dq0002tklnu43trvzu', 'Ưu đãi mới từ Sport Arena! ?', 'Bạn nhận được mã ưu đãi **SUMMER** giảm 50%. Có hiệu lực từ ngày 16/04/2026 đến 16/04/2026.', 'VOUCHER', '0', '/search', '2026-04-16 00:57:05.294');
INSERT INTO notification VALUES ('cmo0rrn00000iwujrd8x3a7sw', 'cmnpux2dn0001tklnnru30skk', 'Ưu đãi mới từ Sport Arena! ?', 'Bạn nhận được mã ưu đãi **SUMMER** giảm 50%. Có hiệu lực từ ngày 16/04/2026 đến 16/04/2026.', 'VOUCHER', '1', '/search', '2026-04-16 00:57:05.294');
INSERT INTO notification VALUES ('cmo0rrn00000jwujrghtff5k6', 'cmnpux2dt0003tklngu3xs9p6', 'Ưu đãi mới từ Sport Arena! ?', 'Bạn nhận được mã ưu đãi **SUMMER** giảm 50%. Có hiệu lực từ ngày 16/04/2026 đến 16/04/2026.', 'VOUCHER', '0', '/search', '2026-04-16 00:57:05.294');
INSERT INTO notification VALUES ('cmo0rrn00000kwujrrahsxr04', 'cmnvw0ib20001p9kiefcznpp3', 'Ưu đãi mới từ Sport Arena! ?', 'Bạn nhận được mã ưu đãi **SUMMER** giảm 50%. Có hiệu lực từ ngày 16/04/2026 đến 16/04/2026.', 'VOUCHER', '0', '/search', '2026-04-16 00:57:05.291');

-- ----------------------------
-- Table structure for `payment`
-- ----------------------------
DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment` (
  `id` varchar(191) NOT NULL,
  `bookingId` varchar(191) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `transactionCode` varchar(191) DEFAULT NULL,
  `paymentDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` enum('UNPAID','PAID','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_bookingId_key` (`bookingId`),
  CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of payment
-- ----------------------------
INSERT INTO payment VALUES ('cmnpux2g10017tklnwbgia6lr', 'cmnpux2fy0015tklnk0xxcc2k', '700000.00', 'CASH_AT_COUNTER', 'TRX-SEED-0', '2026-04-08 09:39:49.538', 'UNPAID');
INSERT INTO payment VALUES ('cmnpux2ga001dtklnhjas837y', 'cmnpux2g8001btklnvuz12e5h', '500000.00', 'CASH_AT_COUNTER', 'TRX-SEED-1', '2026-04-08 09:39:49.547', 'UNPAID');
INSERT INTO payment VALUES ('cmnpux2gh001htklnb64guo4z', 'cmnpux2ge001ftklnnumorzsx', '600000.00', 'CASH_AT_COUNTER', 'TRX-SEED-2', '2026-04-08 09:39:49.553', 'PAID');
INSERT INTO payment VALUES ('cmnpux2go001ntklnmqc30jsl', 'cmnpux2gm001ltklnhbm02qb7', '700000.00', 'CASH_AT_COUNTER', 'TRX-SEED-3', '2026-04-08 09:39:49.561', 'PAID');
INSERT INTO payment VALUES ('cmnpux2gu001rtklnw992nmyz', 'cmnpux2gr001ptkln59napbx8', '700000.00', 'CASH_AT_COUNTER', 'TRX-SEED-4', '2026-04-08 09:39:49.567', 'PAID');
INSERT INTO payment VALUES ('cmo0rc0id0006wujrmy67r81w', 'cmo0rc0gc0002wujrvujw7ntg', '576000.00', 'CASH_AT_COUNTER', 'TRX-1776300296338-7NTG', '2026-04-16 00:44:56.253', 'UNPAID');
INSERT INTO payment VALUES ('cmo1l9w200008qtfjsx797gc7', 'cmo1l9w060002qtfjox4kqqq6', '800000.00', 'CASH_AT_COUNTER', 'TRX-1776350585734-QQQ6', '2026-04-16 14:43:05.651', 'UNPAID');

-- ----------------------------
-- Table structure for `review`
-- ----------------------------
DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `id` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `userId` varchar(191) NOT NULL,
  `bookingId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `adminReply` text DEFAULT NULL,
  `repliedAt` datetime(3) DEFAULT NULL,
  `courtId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Review_bookingId_key` (`bookingId`),
  KEY `Review_userId_idx` (`userId`),
  KEY `Review_courtId_idx` (`courtId`),
  CONSTRAINT `Review_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Review_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `court` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of review
-- ----------------------------
INSERT INTO review VALUES ('cmnpux2g40019tklnn9cghkup', '5', 'Sân rất đẹp, cỏ mượt, đèn sáng.', 'cmnpux2dt0003tklngu3xs9p6', null, '2026-04-08 01:30:00.000', null, null, 'cmnpux2ew000ktklnmbq7dgkf');
INSERT INTO review VALUES ('cmnpux2gj001jtklna4vmbbxg', '5', 'Sân rất đẹp, cỏ mượt, đèn sáng.', 'cmnpux2dt0003tklngu3xs9p6', null, '2026-04-06 07:30:00.000', null, null, 'cmnpux2fb000stklnfrbl5mq1');
INSERT INTO review VALUES ('cmnpux2gx001ttkln7tn02sjk', '5', 'Sân rất đẹp, cỏ mượt, đèn sáng.', 'cmnpux2dt0003tklngu3xs9p6', null, '2026-04-04 13:30:00.000', null, null, 'cmnpux2fo0010tklna1pmhtqb');

-- ----------------------------
-- Table structure for `seasonalprice`
-- ----------------------------
DROP TABLE IF EXISTS `seasonalprice`;
CREATE TABLE `seasonalprice` (
  `id` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `courtId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SeasonalPrice_courtId_idx` (`courtId`),
  CONSTRAINT `SeasonalPrice_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `court` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of seasonalprice
-- ----------------------------

-- ----------------------------
-- Table structure for `settings`
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` varchar(191) NOT NULL DEFAULT 'system',
  `siteName` varchar(191) NOT NULL DEFAULT 'Sport Arena',
  `siteLogo` varchar(191) DEFAULT NULL,
  `contactEmail` varchar(191) DEFAULT NULL,
  `contactPhone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `openingTime` varchar(191) NOT NULL DEFAULT '06:00',
  `closingTime` varchar(191) NOT NULL DEFAULT '23:00',
  `minBookingDuration` int(11) NOT NULL DEFAULT 60,
  `maxAdvanceDays` int(11) NOT NULL DEFAULT 30,
  `cancelBeforeHours` int(11) NOT NULL DEFAULT 24,
  `allowGuestBooking` tinyint(1) NOT NULL DEFAULT 1,
  `maintenanceMode` tinyint(1) NOT NULL DEFAULT 0,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO settings VALUES ('system', 'Sport Arena', '', '', '', '', '06:00', '23:00', '60', '30', '24', '1', '0', '2026-04-16 15:08:08.826');

-- ----------------------------
-- Table structure for `sport`
-- ----------------------------
DROP TABLE IF EXISTS `sport`;
CREATE TABLE `sport` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of sport
-- ----------------------------
INSERT INTO sport VALUES ('cmnpux2dv0004tklnjkyq6ghs', 'Bóng đá', 'Sân cỏ nhân tạo 5 người, 7 người, 11 người.');

-- ----------------------------
-- Table structure for `timeslot`
-- ----------------------------
DROP TABLE IF EXISTS `timeslot`;
CREATE TABLE `timeslot` (
  `id` varchar(191) NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of timeslot
-- ----------------------------
INSERT INTO timeslot VALUES ('cmnpux2e80008tkln1wlihlhh', '16:00:00', '17:30:00');
INSERT INTO timeslot VALUES ('cmnpux2ea0009tklnknxrnaif', '19:00:00', '20:30:00');
INSERT INTO timeslot VALUES ('cmnpux2ea000atkln3bb8edx0', '17:30:00', '19:00:00');
INSERT INTO timeslot VALUES ('cmnpux2ea000btklnavmbrmqi', '20:30:00', '22:00:00');

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `role` enum('ADMIN','STAFF','USER') NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `language` varchar(191) NOT NULL DEFAULT 'vi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO user VALUES ('cmnpux2d80000tkln9jmi2eb1', 'Admin Hệ Thống', 'admin@sportarena.com', '2026-04-08 09:39:49.430', null, '$2b$10$g9VAu5vt7bPzkuVQCLBLJ./phGf/j5fO.ttZwHgC5hfzrhEJ3x4xy', '0909999999', 'USER', '2026-04-08 09:39:49.434', '2026-04-08 09:40:45.614', 'vi');
INSERT INTO user VALUES ('cmnpux2dn0001tklnnru30skk', 'Hùng Dân', 'danggiahung712@gmail.com', '2026-04-08 09:39:49.450', null, '$2b$10$g9VAu5vt7bPzkuVQCLBLJ./phGf/j5fO.ttZwHgC5hfzrhEJ3x4xy', '0988776655', 'ADMIN', '2026-04-08 09:39:49.452', '2026-04-17 14:31:00.381', 'vi');
INSERT INTO user VALUES ('cmnpux2dq0002tklnu43trvzu', 'Nhân viên', 'staff@sportarena.com', '2026-04-08 09:39:49.453', null, '$2b$10$g9VAu5vt7bPzkuVQCLBLJ./phGf/j5fO.ttZwHgC5hfzrhEJ3x4xy', '0911111111', 'STAFF', '2026-04-08 09:39:49.455', '2026-04-08 09:39:49.455', 'vi');
INSERT INTO user VALUES ('cmnpux2dt0003tklngu3xs9p6', 'Nguyễn Văn An', 'khachhang@gmail.com', '2026-04-08 09:39:49.456', null, '$2b$10$g9VAu5vt7bPzkuVQCLBLJ./phGf/j5fO.ttZwHgC5hfzrhEJ3x4xy', '0912345678', 'USER', '2026-04-08 09:39:49.457', '2026-04-08 09:39:49.457', 'vi');
INSERT INTO user VALUES ('cmnvvzobc0000p9kio9gxa5go', 'Sport', '25020189@gmail.com', null, null, '$2b$10$lWc.tJPNFWrVoNlIxt3SZ.f0aLBucsVa.2FNQnvHbs4EpxKgEKjgK', null, 'USER', '2026-04-12 14:56:27.861', '2026-04-12 14:56:27.861', 'vi');
INSERT INTO user VALUES ('cmnvw0ib20001p9kiefcznpp3', 'Sport', '25020189@vnu.edu.vn', null, null, '$2b$10$AoVUyLk5wRUwFsTFsLvBleewMLBh5oXXVeTrkZQEin1IdsJkMhzBy', null, 'USER', '2026-04-12 14:57:06.734', '2026-04-12 14:57:06.734', 'vi');
INSERT INTO user VALUES ('cmo1m4cue0009qtfj7bd3mnzr', 'Me', 'danggiahung715@gmail.com', null, null, '$2b$10$/FoSTKCUg2nv40rOfoW.zeRyzS5RMnFxBsfEmDJN.8uPbBnQHZvte', null, 'USER', '2026-04-16 15:06:47.172', '2026-04-16 15:06:47.172', 'vi');

-- ----------------------------
-- Table structure for `voucher`
-- ----------------------------
DROP TABLE IF EXISTS `voucher`;
CREATE TABLE `voucher` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `discountType` enum('PERCENT','FIXED') NOT NULL,
  `discountValue` decimal(10,2) NOT NULL,
  `minOrderValue` decimal(10,2) DEFAULT NULL,
  `maxDiscount` decimal(10,2) DEFAULT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `usageLimit` int(11) DEFAULT NULL,
  `usedCount` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Voucher_code_key` (`code`),
  KEY `voucher_userId_idx` (`userId`),
  CONSTRAINT `voucher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of voucher
-- ----------------------------
INSERT INTO voucher VALUES ('cmo08au8s0001y4lyh5uj96ld', 'SPORT', 'PERCENT', '20.00', '500000.00', null, '2026-04-15 00:00:00.000', '2026-04-17 00:00:00.000', null, '1', '1', '2026-04-15 15:52:08.850', '2026-04-16 00:44:56.253', null);

-- ----------------------------
-- Table structure for `wishlist`
-- ----------------------------
DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE `wishlist` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `courtId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Wishlist_userId_courtId_key` (`userId`,`courtId`),
  KEY `Wishlist_userId_idx` (`userId`),
  KEY `Wishlist_courtId_fkey` (`courtId`),
  CONSTRAINT `Wishlist_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `court` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of wishlist
-- ----------------------------

-- ----------------------------
-- Table structure for `_amenitytocourttype`
-- ----------------------------
DROP TABLE IF EXISTS `_amenitytocourttype`;
CREATE TABLE `_amenitytocourttype` (
  `A` varchar(191) NOT NULL,
  `B` varchar(191) NOT NULL,
  UNIQUE KEY `_amenitytocourttype_AB_unique` (`A`,`B`),
  KEY `_amenitytocourttype_B_index` (`B`),
  CONSTRAINT `_amenitytocourttype_A_fkey` FOREIGN KEY (`A`) REFERENCES `amenity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_amenitytocourttype_B_fkey` FOREIGN KEY (`B`) REFERENCES `courttype` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of _amenitytocourttype
-- ----------------------------

-- ----------------------------
-- Table structure for `_prisma_migrations`
-- ----------------------------
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of _prisma_migrations
-- ----------------------------
INSERT INTO _prisma_migrations VALUES ('f864b35c-1753-467c-a503-00ba6f8caf00', 'bec6284f0e8c8a13184dd7e98bb6a722b5de485454833bc2cd40598ddc65768f', '2026-04-02 00:57:20.886', '20260402005720_add_settings', null, null, '2026-04-02 00:57:20.066', '1');
INSERT INTO _prisma_migrations VALUES ('fad7a864-c36a-4e67-8e2f-cc87e4eb9d72', '995463fe6153df1a3b7c28088567fee728c5716b777d5c963fd8be638bb87a6d', '2026-04-02 00:57:18.187', '20260103185115_init_full_db', null, null, '2026-04-02 00:57:17.421', '1');
