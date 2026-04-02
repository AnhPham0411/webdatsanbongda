/*
  Warnings:

  - You are about to drop the column `checkIn` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `checkOut` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `seasonalprice` table. All the data in the column will be lost.
  - You are about to drop the `_amenitytoroomtype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roomimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roomtype` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courtId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSlotId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courtId` to the `SeasonalPrice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_amenitytoroomtype` DROP FOREIGN KEY `_AmenityToRoomType_A_fkey`;

-- DropForeignKey
ALTER TABLE `_amenitytoroomtype` DROP FOREIGN KEY `_AmenityToRoomType_B_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `room` DROP FOREIGN KEY `Room_roomTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `roomimage` DROP FOREIGN KEY `RoomImage_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `seasonalprice` DROP FOREIGN KEY `SeasonalPrice_roomId_fkey`;

-- DropIndex
DROP INDEX `Booking_roomId_checkIn_checkOut_idx` ON `booking`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `checkIn`,
    DROP COLUMN `checkOut`,
    DROP COLUMN `roomId`,
    ADD COLUMN `courtId` VARCHAR(191) NOT NULL,
    ADD COLUMN `date` DATE NOT NULL,
    ADD COLUMN `depositAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `discountValue` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `originalPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `timeSlotId` VARCHAR(191) NOT NULL,
    ADD COLUMN `voucherId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `review` ADD COLUMN `adminReply` TEXT NULL,
    ADD COLUMN `repliedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `seasonalprice` DROP COLUMN `roomId`,
    ADD COLUMN `courtId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_amenitytoroomtype`;

-- DropTable
DROP TABLE `room`;

-- DropTable
DROP TABLE `roomimage`;

-- DropTable
DROP TABLE `roomtype`;

-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sport` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourtType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `basePrice` DECIMAL(10, 2) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `sportId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Court` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `courtTypeId` VARCHAR(191) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Court_courtTypeId_idx`(`courtTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourtImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `courtId` VARCHAR(191) NOT NULL,

    INDEX `CourtImage_courtId_idx`(`courtId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Voucher` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENT', 'FIXED') NOT NULL,
    `discountValue` DECIMAL(10, 2) NOT NULL,
    `minOrderValue` DECIMAL(10, 2) NULL,
    `maxDiscount` DECIMAL(10, 2) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Voucher_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimeSlot` (
    `id` VARCHAR(191) NOT NULL,
    `startTime` TIME NOT NULL,
    `endTime` TIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wishlist` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `courtId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Wishlist_userId_idx`(`userId`),
    UNIQUE INDEX `Wishlist_userId_courtId_key`(`userId`, `courtId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'system',
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'Sport Arena',
    `siteLogo` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `openingTime` VARCHAR(191) NOT NULL DEFAULT '06:00',
    `closingTime` VARCHAR(191) NOT NULL DEFAULT '23:00',
    `minBookingDuration` INTEGER NOT NULL DEFAULT 60,
    `maxAdvanceDays` INTEGER NOT NULL DEFAULT 30,
    `cancelBeforeHours` INTEGER NOT NULL DEFAULT 24,
    `allowGuestBooking` BOOLEAN NOT NULL DEFAULT true,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AmenityToCourtType` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AmenityToCourtType_AB_unique`(`A`, `B`),
    INDEX `_AmenityToCourtType_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Booking_courtId_date_timeSlotId_idx` ON `Booking`(`courtId`, `date`, `timeSlotId`);

-- CreateIndex
CREATE INDEX `Booking_voucherId_idx` ON `Booking`(`voucherId`);

-- CreateIndex
CREATE INDEX `SeasonalPrice_courtId_idx` ON `SeasonalPrice`(`courtId`);

-- AddForeignKey
ALTER TABLE `CourtType` ADD CONSTRAINT `CourtType_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourtType` ADD CONSTRAINT `CourtType_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Court` ADD CONSTRAINT `Court_courtTypeId_fkey` FOREIGN KEY (`courtTypeId`) REFERENCES `CourtType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourtImage` ADD CONSTRAINT `CourtImage_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `Court`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `Court`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_timeSlotId_fkey` FOREIGN KEY (`timeSlotId`) REFERENCES `TimeSlot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `Voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeasonalPrice` ADD CONSTRAINT `SeasonalPrice_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `Court`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_courtId_fkey` FOREIGN KEY (`courtId`) REFERENCES `Court`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AmenityToCourtType` ADD CONSTRAINT `_AmenityToCourtType_A_fkey` FOREIGN KEY (`A`) REFERENCES `Amenity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AmenityToCourtType` ADD CONSTRAINT `_AmenityToCourtType_B_fkey` FOREIGN KEY (`B`) REFERENCES `CourtType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
