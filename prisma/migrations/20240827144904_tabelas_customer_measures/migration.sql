-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Measures` (
    `uuid` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_code` INTEGER NOT NULL,
    `measure_datetime` DATETIME(3) NOT NULL,
    `measure_type` VARCHAR(191) NOT NULL,
    `measure_value` DOUBLE NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `has_confirmed` BOOLEAN NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Measures` ADD CONSTRAINT `Measures_customer_code_fkey` FOREIGN KEY (`customer_code`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
