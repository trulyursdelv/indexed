## Indexed :flying_saucer:

Minimally-touched indexed database library structured after WebStorage.

```javascript
const db = await Indexed.open("testdb");

await db.set("auth", {
  name: "John Doe",
  email: "johndoe@gmail.com"
});

const name = await db.get("auth/name");
const email = await db.get("auth/email");
```

## Installation

Since Indexed uses client-side features (indexedDB and cookies), it is highly recommended to use CDN.

```html
<script src="https://cdn.jsdelivr.net/gh/creuserr/indexed@main/dist/v2/indexed.min.js"></script>
```

## Documentation

- [Getting Started](docs/README.md)
- [Managing Database](docs/DATABASE.md)
- [Syncing to Cookie](docs/COOKIE.md)
- [Creating a Reference](docs/REFERENCE.md)
