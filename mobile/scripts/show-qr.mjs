import { networkInterfaces } from 'node:os';
import qrcode from 'qrcode-terminal';

const port = Number(process.argv[2]) || 8081;
const lan = Object.values(networkInterfaces())
  .flat()
  .find((n) => n?.family === 'IPv4' && !n.internal)?.address ?? '127.0.0.1';

const url = `exp://${lan}:${port}`;

console.log('\nExpo Go — scanne ce QR (app Expo Go, meme Wi-Fi)\n');
qrcode.generate(url, { small: true });
console.log(`\n${url}\n`);
console.log('Ou dans Expo Go : "Enter URL manually" et colle l\'URL ci-dessus.\n');
console.log('Lance avant : npx expo start (sans --android pour voir le QR natif)\n');
