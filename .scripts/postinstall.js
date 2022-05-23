const fs = require('fs');

const content =
  fs.readFileSync(
    'node_modules/ga-multisig-contract/contracts/SimpleGAMultiSig.aes',
    'utf-8')

fs.writeFileSync(
  'src/utils/aeternity/contracts/SimpleGAMultiSig.aes',
  content,
  'utf-8');
