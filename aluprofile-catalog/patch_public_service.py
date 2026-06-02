with open("apps/backend/src/public/public.service.ts", "r") as f:
    content = f.read()

# Remove the mapProfileWithCustomer logic in getOverview
content = content.replace("""    const userIds = [...new Set(newestProfiles.filter(p => p.ownerClerkUserId).map(p => p.ownerClerkUserId as string))];
    let userMap = new Map<string, string>();
    if (userIds.length > 0) {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const users = await clerk.users.getUserList({ userId: userIds });
        userMap = new Map(users.data.map((u: any) => [u.id, u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.username || u.emailAddresses[0]?.emailAddress || 'Customer')]));
      } catch (error) {
        console.error('Failed to fetch clerk users for overview:', error);
      }
    }

    const mapProfileWithCustomer = (profile: any) => {
      const p = { ...profile };
      if (p.ownerClerkUserId && userMap.has(p.ownerClerkUserId)) {
        p.supplier = { id: 0, name: userMap.get(p.ownerClerkUserId) || 'Customer' } as any;
      }
      return this.localizeProfile(lang, p);
    };

    return {
      totals: { profiles: totalProfiles, visits: visitsMetric?.value || 0 },
      applications: applications.map((item) => this.localizeOption(lang, item)),
      crossSections: crossSections.map((item) => this.localizeOption(lang, item)),
      newestProfiles: newestProfiles.map((item) => mapProfileWithCustomer(item)),
    };""", """    return {
      totals: { profiles: totalProfiles, visits: visitsMetric?.value || 0 },
      applications: applications.map((item) => this.localizeOption(lang, item)),
      crossSections: crossSections.map((item) => this.localizeOption(lang, item)),
      newestProfiles: newestProfiles.map((item) => this.localizeProfile(lang, item)),
    };""")

# Remove from getProfiles
content = content.replace("""    const userIds = [...new Set(profiles.filter(p => p.ownerClerkUserId).map(p => p.ownerClerkUserId as string))];
    let userMap = new Map<string, string>();
    if (userIds.length > 0) {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const users = await clerk.users.getUserList({ userId: userIds });
        userMap = new Map(users.data.map((u: any) => [u.id, u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.username || u.emailAddresses[0]?.emailAddress || 'Customer')]));
      } catch (error) {
        console.error('Failed to fetch clerk users for profiles:', error);
      }
    }

    return profiles.map((item) => {
      const p = { ...item };
      if (p.ownerClerkUserId && userMap.has(p.ownerClerkUserId)) {
        p.supplier = { id: 0, name: userMap.get(p.ownerClerkUserId) || 'Customer' } as any;
      }
      return this.localizeProfile(lang, p);
    });""", """    return profiles.map((item) => this.localizeProfile(lang, item));""")

# Remove from getProfileById
content = content.replace("""    if (!profile) return null;

    if (profile.ownerClerkUserId) {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const user = await clerk.users.getUser(profile.ownerClerkUserId);
        profile.supplier = {
          id: 0,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || user.emailAddresses[0]?.emailAddress || 'Customer')
        } as any;
      } catch (error) {
        console.error('Failed to fetch clerk user for profile by id:', error);
      }
    }

    return this.localizeProfile(lang, profile);""", """    if (!profile) return null;
    return this.localizeProfile(lang, profile);""")

with open("apps/backend/src/public/public.service.ts", "w") as f:
    f.write(content)
