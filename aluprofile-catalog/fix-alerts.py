with open('apps/frontend/src/CustomerPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("alert('Saved!');", "showMessage('Supplier saved successfully', 'success');")
content = content.replace("alert('Failed to save supplier profile: ' + e.message);", "showMessage('Failed to save supplier profile: ' + parseApiError(e), 'error');")

with open('apps/frontend/src/CustomerPage.tsx', 'w') as f:
    f.write(content)

with open('apps/frontend/src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("alert(parseApiError(err));", "setMessage(parseApiError(err));")

with open('apps/frontend/src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed alerts")
