import fs from 'fs';
import path from 'path';

const IPFS_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../../ipfs/config')));
const CONFIG_PUBLIC = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/config.public.json')));
const CONFIG_PRIVATE = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/config.private.json')));

const CONSTANTS = {
  CONFIG_PRIVATE,
  CONFIG_PUBLIC,
  API_URL: 'http://localhost:3000',

  IPFS_ID: IPFS_CONFIG.Identity.PeerID,
  IPFS_PRIVATE_KEY: IPFS_CONFIG.Identity.PrivKey
};

console.log(CONSTANTS);
export default CONSTANTS;
