const { execSync } = require('child_process');

console.log('🚀 Starting deployment process...');

try {
    // Check database connection
    console.log('🔍 Checking database connection...');
    execSync('npx prisma db pull --print', { stdio: 'inherit' });
    console.log('✅ Database connection successful');

    // Run migrations
    console.log('📦 Running database migrations...');
    try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations completed successfully');
    } catch (error) {
        console.error('⚠️  Migration error:', error.message);

        // If migrations fail, try to reset the migration history
        console.log('🔧 Attempting to fix migration issues...');

        // Mark known migrations as applied if they already exist
        const migrations = [
            '20250715030526_init',
            '20250717185041_add_conta_financeira_to_credit_cards',
            '20250723143234_add_category_foreign_keys'
        ];

        for (const migration of migrations) {
            try {
                console.log(`📌 Marking ${migration} as applied...`);
                execSync(`npx prisma migrate resolve --applied "${migration}"`, { stdio: 'inherit' });
            } catch (e) {
                console.log(`⏭️  Skipping ${migration} (may already be applied)`);
            }
        }

        // Try migrations again
        console.log('🔄 Retrying migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }

    // Generate Prisma Client
    console.log('🏗️  Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Start the application
    console.log('🎯 Starting the application...');
    require('../dist/server.js');

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}