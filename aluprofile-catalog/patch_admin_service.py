with open("apps/backend/src/admin/admin.service.ts", "r") as f:
    content = f.read()

upsert_logic = """  async seedDemoData() {
    const seedSupplier = async (data: any) => {
      const existing = await this.prisma.supplier.findFirst({ where: { name: data.name } });
      if (existing) {
        return this.prisma.supplier.update({ where: { id: existing.id }, data });
      }
      return this.prisma.supplier.create({ data });
    };

    const suppliers = await Promise.all([
      seedSupplier({
        name: 'Aluzone GmbH',
        nameDe: 'Aluzone GmbH',
        address: 'Grosse Stadtgutgasse 29/12, A-1020 Wien',
        contactPerson: 'Oliver Kascha',
        phone: '+43 699 122 35 850',
        email: 'office@aluzone.example',
        website: 'https://aluprofile.biz',
      }),
      seedSupplier({
        name: 'Tepro Tec',
        nameDe: 'Tepro Tec',
        contactPerson: 'Sales Team',
        phone: '+43 676 123 4567',
        website: 'https://tepro.example',
      }),
      seedSupplier({
        name: 'DasaTech',
        nameDe: 'DasaTech',
        contactPerson: 'Operations Desk',
        phone: '+43 678 590 9989',
        website: 'https://dasatech.example',
      }),
    ]);"""

import re
content = re.sub(r'  async seedDemoData\(\) \{[\s\S]*?\}\),\n    \]\);', upsert_logic, content)

with open("apps/backend/src/admin/admin.service.ts", "w") as f:
    f.write(content)
