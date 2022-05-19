const fs = require('fs');

const fungibleTokenFullInterface =
  fs.readFileSync(
    'node_modules/ga-contractDetail-contract/contracts/SimpleGAMultiSig.aes',
    'utf-8');

fs.writeFileSync(
  'src/utils/aeternity/contracts/SimpleGAMultiSig.aes',
  fungibleTokenFullInterface,
  'utf-8');
