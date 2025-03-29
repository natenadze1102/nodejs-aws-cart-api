import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

// Ensure dist-lambda directory exists
const distDir = path.join(__dirname);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Bundle with esbuild
async function bundle() {
  try {
    // Bundle the lambda handler
    await esbuild.build({
      entryPoints: ['src/lambda.ts'],
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node18',
      outfile: path.join(distDir, 'index.js'),
      // External packages that will be in the Lambda layer
      external: [
        '@nestjs/*',
        'rxjs/*',
        'typeorm',
        'pg',
        'passport*',
        '@vendia/*',
        'reflect-metadata',
      ],
      sourcemap: true,
      metafile: true,
      // Add path alias resolver
      alias: {
        'src/*': './src/*',
      },
    });

    console.log('Lambda function built successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

bundle();
