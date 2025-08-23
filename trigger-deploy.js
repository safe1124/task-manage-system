const https = require('https');

// Vercel Deploy Hook을 트리거하는 함수
function triggerDeploy() {
  console.log('🚀 Triggering Vercel deployment...');
  
  // 이 URL은 Vercel 프로젝트 설정에서 "Deploy Hooks"에서 생성할 수 있습니다
  // Vercel Dashboard > Project > Settings > Git > Deploy Hooks
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  
  if (!deployHookUrl) {
    console.log('⚠️  VERCEL_DEPLOY_HOOK_URL environment variable not set');
    console.log('📝 To get this URL:');
    console.log('   1. Go to Vercel Dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to Settings > Git');
    console.log('   4. Create a Deploy Hook');
    console.log('   5. Set VERCEL_DEPLOY_HOOK_URL=<your_hook_url>');
    return;
  }
  
  const url = new URL(deployHookUrl);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`✅ Deploy triggered! Status: ${res.statusCode}`);
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Error triggering deploy:', e);
  });
  
  req.write(JSON.stringify({ 
    trigger: 'manual',
    timestamp: new Date().toISOString()
  }));
  req.end();
}

// 스크립트 실행
triggerDeploy();
