const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    console.log('📝 Loading environment variables from .env.local');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.warn('⚠️ .env.local not found, using existing environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
    console.log('Please ensure these are set in your .env.local file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
    const buckets = ['pilot-documents', 'product-images'];
    
    console.log('🚀 Starting Storage Bucket Setup...');

    for (const bucketName of buckets) {
        console.log(`\n📦 Checking bucket: "${bucketName}"...`);
        
        try {
            const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName);
            
            if (getError && getError.message.includes('not found')) {
                console.log(`   ✨ Creating bucket "${bucketName}"...`);
                const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
                    public: true,
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'],
                    fileSizeLimit: 5242880 // 5MB
                });
                
                if (createError) {
                    console.error(`   ❌ Failed to create bucket "${bucketName}":`, createError.message);
                } else {
                    console.log(`   ✅ Successfully created bucket "${bucketName}".`);
                }
            } else if (getError) {
                console.error(`   ❌ Error checking bucket "${bucketName}":`, getError.message);
            } else {
                console.log(`   ✅ Bucket "${bucketName}" already exists.`);
            }
        } catch (err) {
            console.error(`   ❌ Unexpected error for "${bucketName}":`, err.message);
        }
    }
    
    console.log('\n🏁 Storage setup complete!');
}

setupBuckets();
