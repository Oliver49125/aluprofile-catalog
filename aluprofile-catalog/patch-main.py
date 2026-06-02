with open('apps/backend/src/main.ts', 'r') as f: content = f.read()
if "PrismaExceptionFilter" not in content:
    content = content.replace("import * as Sentry from '@sentry/node';", "import * as Sentry from '@sentry/node';\nimport { PrismaExceptionFilter } from './prisma-exception.filter';")
    content = content.replace("app.setGlobalPrefix('api');", "app.setGlobalPrefix('api');\n  app.useGlobalFilters(new PrismaExceptionFilter());")
    with open('apps/backend/src/main.ts', 'w') as f: f.write(content)
print("Patched main.ts")
