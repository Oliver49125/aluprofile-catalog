const bcrypt = require('bcrypt');
async function main() {
  const match = await bcrypt.compare('password123', '$2b$10$9GGQBz6mJMsjgMSCA3kXPeVGPhdvb9MYvfnqKqtIN3dqcKiwl.15i');
  console.log('Match:', match);
}
main().catch(console.error);
