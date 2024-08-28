/*
  Warnings:

  - The primary key for the `customer` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `measures` DROP FOREIGN KEY `Measures_customer_code_fkey`;

-- AlterTable
ALTER TABLE `customer` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `measures` MODIFY `customer_code` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Measures` ADD CONSTRAINT `Measures_customer_code_fkey` FOREIGN KEY (`customer_code`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
