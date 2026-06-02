import re

with open('apps/frontend/src/App.tsx', 'r') as f:
    content = f.read()

# Add websiteVisits state
state_addition = """
  const [websiteVisits, setWebsiteVisits] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/public/visits', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.value === 'number') {
          setWebsiteVisits(data.value);
        }
      })
      .catch(err => console.error('Failed to increment visits', err));
  }, []);
"""

content = content.replace("const [page, setPage] = useState(1);", "const [page, setPage] = useState(1);\n" + state_addition)

with open('apps/frontend/src/App.tsx', 'w') as f:
    f.write(content)

print("Patched websiteVisits state")
