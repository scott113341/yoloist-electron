import fs from 'fs';
import path from 'path';

const IPFS_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../../ipfs/config')));

const CONFIG_PRIVATE_PATH = path.join(__dirname, '../../public/config.private.json');
const CONFIG_PUBLIC_PATH = path.join(__dirname, '../../public/config.public.json');
const CONFIG_PRIVATE = JSON.parse(fs.readFileSync(CONFIG_PRIVATE_PATH));
const CONFIG_PUBLIC = JSON.parse(fs.readFileSync(CONFIG_PUBLIC_PATH));

const CONSTANTS = {
  CONFIG_PRIVATE_PATH,
  CONFIG_PUBLIC_PATH,
  CONFIG_PRIVATE,
  CONFIG_PUBLIC,
  API_URL: 'http://localhost:3000',
  YOLOIST_URL: '',
  YOLOIST_IPFS: '/ip4/104.236.141.25/tcp/4001/ipfs/QmXR9Mbf9SRutksLyF1ASz2QbzPwUd4EBapPHXpzNPDuqQ',

  IPFS_ID: IPFS_CONFIG.Identity.PeerID,
  IPFS_PRIVATE_KEY: IPFS_CONFIG.Identity.PrivKey
};

console.log(CONSTANTS);
export default CONSTANTS;
