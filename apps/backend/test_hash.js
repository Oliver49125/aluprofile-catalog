const bcrypt = require('bcryptjs');
const hash = '$2b$10$5BnxaSl.VTCKjmwOMmnnf.53EadTo9O56XbmXEoE2J.kleRwMgxky';
console.log(bcrypt.compareSync('123456', hash));
