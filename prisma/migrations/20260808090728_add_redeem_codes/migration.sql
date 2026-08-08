-- CreateTable
CREATE TABLE `RedeemCode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `plan` ENUM('FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE') NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `redeemedById` VARCHAR(191) NULL,
    `redeemedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RedeemCode_code_key`(`code`),
    INDEX `RedeemCode_createdById_idx`(`createdById`),
    INDEX `RedeemCode_redeemedById_idx`(`redeemedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RedeemCode` ADD CONSTRAINT `RedeemCode_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RedeemCode` ADD CONSTRAINT `RedeemCode_redeemedById_fkey` FOREIGN KEY (`redeemedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
