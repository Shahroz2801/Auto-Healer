-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `clerkId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
    `credits` INTEGER NOT NULL DEFAULT 100,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_clerkId_key`(`clerkId`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_slug_key`(`slug`),
    INDEX `Organization_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizationMember` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'EDITOR',
    `invitedEmail` VARCHAR(191) NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrganizationMember_userId_idx`(`userId`),
    UNIQUE INDEX `OrganizationMember_organizationId_userId_key`(`organizationId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `importMethod` ENUM('URL', 'ZIP_UPLOAD', 'FOLDER_UPLOAD', 'GITHUB', 'GITLAB', 'BITBUCKET', 'WORDPRESS', 'SHOPIFY', 'VSCODE_EXTENSION', 'BROWSER_EXTENSION', 'FTP', 'SFTP', 'SSH', 'DOCKER', 'API') NOT NULL,
    `sourceUrl` VARCHAR(191) NULL,
    `framework` ENUM('HTML', 'CSS', 'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'NEXTJS', 'VUE', 'NUXT', 'ANGULAR', 'SVELTE', 'ASTRO', 'REMIX', 'NODE', 'EXPRESS', 'LARAVEL', 'PHP', 'WORDPRESS', 'SHOPIFY', 'MAGENTO', 'PYTHON', 'DJANGO', 'FLASK', 'RUBY', 'RAILS', 'JAVA', 'SPRING', 'GO', 'RUST', 'CSHARP', 'ASPNET', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `detectedStack` JSON NULL,
    `healthScore` INTEGER NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Project_organizationId_idx`(`organizationId`),
    INDEX `Project_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectFile` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NULL,
    `sizeBytes` INTEGER NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `sha256` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProjectFile_projectId_idx`(`projectId`),
    UNIQUE INDEX `ProjectFile_projectId_path_key`(`projectId`, `path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Repository` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `provider` ENUM('GITHUB', 'GITLAB', 'BITBUCKET') NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `defaultBranch` VARCHAR(191) NOT NULL DEFAULT 'main',
    `installationId` VARCHAR(191) NULL,
    `webhookSecret` VARCHAR(191) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Repository_projectId_key`(`projectId`),
    INDEX `Repository_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Website` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `sslExpiresAt` DATETIME(3) NULL,
    `lastCrawledAt` DATETIME(3) NULL,
    `pageCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Website_projectId_key`(`projectId`),
    INDEX `Website_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scan` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `status` ENUM('QUEUED', 'CRAWLING', 'ANALYZING', 'AI_REVIEWING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    `categories` JSON NOT NULL,
    `triggeredBy` ENUM('MANUAL', 'SCHEDULED', 'WEBHOOK', 'DEPLOYMENT') NOT NULL DEFAULT 'MANUAL',
    `healthScore` INTEGER NULL,
    `performanceScore` INTEGER NULL,
    `seoScore` INTEGER NULL,
    `accessibilityScore` INTEGER NULL,
    `securityScore` INTEGER NULL,
    `bestPracticesScore` INTEGER NULL,
    `lighthouseRaw` JSON NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Scan_projectId_idx`(`projectId`),
    INDEX `Scan_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Issue` (
    `id` VARCHAR(191) NOT NULL,
    `scanId` VARCHAR(191) NOT NULL,
    `category` ENUM('SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'CODE_QUALITY', 'BEST_PRACTICES', 'BROKEN_LINKS', 'BUNDLE_SIZE', 'CORE_WEB_VITALS') NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') NOT NULL,
    `status` ENUM('OPEN', 'FIX_GENERATED', 'FIX_PREVIEWED', 'FIX_APPLIED', 'FIX_REVERTED', 'IGNORED', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `filePath` VARCHAR(191) NULL,
    `lineStart` INTEGER NULL,
    `lineEnd` INTEGER NULL,
    `impact` TEXT NULL,
    `estPerformanceGain` INTEGER NULL,
    `estSeoGain` INTEGER NULL,
    `aiExplanation` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Issue_scanId_idx`(`scanId`),
    INDEX `Issue_severity_idx`(`severity`),
    INDEX `Issue_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fix` (
    `id` VARCHAR(191) NOT NULL,
    `issueId` VARCHAR(191) NOT NULL,
    `status` ENUM('GENERATED', 'PREVIEWED', 'APPLIED', 'REVERTED', 'REJECTED') NOT NULL DEFAULT 'GENERATED',
    `aiProvider` VARCHAR(191) NOT NULL DEFAULT 'gemini',
    `diff` TEXT NOT NULL,
    `explanation` TEXT NOT NULL,
    `filesChanged` JSON NOT NULL,
    `previewUrl` VARCHAR(191) NULL,
    `pullRequestUrl` VARCHAR(191) NULL,
    `appliedAt` DATETIME(3) NULL,
    `revertedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Fix_issueId_idx`(`issueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'New chat',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Chat_projectId_idx`(`projectId`),
    INDEX `Chat_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` TEXT NOT NULL,
    `toolCalls` JSON NULL,
    `aiProvider` VARCHAR(191) NOT NULL DEFAULT 'gemini',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatMessage_chatId_idx`(`chatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `scanId` VARCHAR(191) NULL,
    `format` ENUM('PDF', 'DOCX', 'HTML', 'JSON', 'CSV') NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `summary` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Report_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deployment` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `provider` ENUM('VERCEL', 'NETLIFY', 'CLOUDFLARE', 'AWS', 'AZURE', 'GCP', 'RAILWAY', 'RENDER', 'DOCKER', 'FTP', 'SFTP', 'SSH') NOT NULL,
    `status` ENUM('PENDING', 'BUILDING', 'DEPLOYING', 'SUCCESS', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `url` VARCHAR(191) NULL,
    `commitSha` VARCHAR(191) NULL,
    `logs` TEXT NULL,
    `triggeredById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,

    INDEX `Deployment_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Monitor` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `frequency` ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY') NOT NULL DEFAULT 'DAILY',
    `categories` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `channels` JSON NOT NULL,
    `lastRunAt` DATETIME(3) NULL,
    `nextRunAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Monitor_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonitorIncident` (
    `id` VARCHAR(191) NOT NULL,
    `monitorId` VARCHAR(191) NOT NULL,
    `type` ENUM('NEW_BUG', 'BROKEN_LINK', 'SSL_EXPIRING', 'PERFORMANCE_DROP', 'SECURITY_VULNERABILITY', 'DOWNTIME') NOT NULL,
    `severity` ENUM('CRITICAL', 'WARNING', 'INFO') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MonitorIncident_monitorId_idx`(`monitorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('SCAN_COMPLETE', 'FIX_READY', 'INCIDENT', 'DEPLOYMENT', 'BILLING', 'SYSTEM') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `href` VARCHAR(191) NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `plan` ENUM('FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
    `status` ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE') NOT NULL DEFAULT 'TRIALING',
    `stripeCustomerId` VARCHAR(191) NULL,
    `stripeSubscriptionId` VARCHAR(191) NULL,
    `stripePriceId` VARCHAR(191) NULL,
    `currentPeriodEnd` DATETIME(3) NULL,
    `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscription_organizationId_key`(`organizationId`),
    UNIQUE INDEX `Subscription_stripeCustomerId_key`(`stripeCustomerId`),
    UNIQUE INDEX `Subscription_stripeSubscriptionId_key`(`stripeSubscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `stripeInvoiceId` VARCHAR(191) NOT NULL,
    `amountDue` INTEGER NOT NULL,
    `amountPaid` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'usd',
    `status` VARCHAR(191) NOT NULL,
    `hostedInvoiceUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invoice_stripeInvoiceId_key`(`stripeInvoiceId`),
    INDEX `Invoice_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('SCAN', 'AI_FIX', 'AI_CHAT', 'REPORT', 'PURCHASE', 'MONTHLY_GRANT', 'REFUND') NOT NULL,
    `amount` INTEGER NOT NULL,
    `balanceAfter` INTEGER NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CreditTransaction_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Integration` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `provider` ENUM('GITHUB', 'GITLAB', 'BITBUCKET', 'GOOGLE_ANALYTICS', 'GOOGLE_SEARCH_CONSOLE', 'CLOUDFLARE', 'PAGESPEED', 'AHREFS', 'SEMRUSH', 'STRIPE', 'SLACK', 'DISCORD', 'TELEGRAM') NOT NULL,
    `encryptedCredentials` TEXT NOT NULL,
    `metadata` JSON NULL,
    `connectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Integration_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `Integration_organizationId_provider_key`(`organizationId`, `provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plugin` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `platform` ENUM('WORDPRESS', 'SHOPIFY', 'VSCODE', 'CHROME', 'FIREFOX', 'EDGE', 'CLI', 'GITHUB_ACTION', 'GITLAB_CI') NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `iconUrl` VARCHAR(191) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Plugin_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PluginInstall` (
    `id` VARCHAR(191) NOT NULL,
    `pluginId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `installedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PluginInstall_pluginId_organizationId_key`(`pluginId`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApiKey` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `keyPrefix` VARCHAR(191) NOT NULL,
    `hashedKey` VARCHAR(191) NOT NULL,
    `scopes` JSON NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ApiKey_hashedKey_key`(`hashedKey`),
    INDEX `ApiKey_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizationFeatureFlag` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `OrganizationFeatureFlag_organizationId_key_key`(`organizationId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NULL,
    `targetId` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_organizationId_idx`(`organizationId`),
    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTicket` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportTicket_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectFile` ADD CONSTRAINT `ProjectFile_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Repository` ADD CONSTRAINT `Repository_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Website` ADD CONSTRAINT `Website_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scan` ADD CONSTRAINT `Scan_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Issue` ADD CONSTRAINT `Issue_scanId_fkey` FOREIGN KEY (`scanId`) REFERENCES `Scan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fix` ADD CONSTRAINT `Fix_issueId_fkey` FOREIGN KEY (`issueId`) REFERENCES `Issue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_scanId_fkey` FOREIGN KEY (`scanId`) REFERENCES `Scan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deployment` ADD CONSTRAINT `Deployment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Monitor` ADD CONSTRAINT `Monitor_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonitorIncident` ADD CONSTRAINT `MonitorIncident_monitorId_fkey` FOREIGN KEY (`monitorId`) REFERENCES `Monitor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Integration` ADD CONSTRAINT `Integration_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PluginInstall` ADD CONSTRAINT `PluginInstall_pluginId_fkey` FOREIGN KEY (`pluginId`) REFERENCES `Plugin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApiKey` ADD CONSTRAINT `ApiKey_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApiKey` ADD CONSTRAINT `ApiKey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationFeatureFlag` ADD CONSTRAINT `OrganizationFeatureFlag_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
