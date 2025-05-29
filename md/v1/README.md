## Indexed

Minimalistic API for IndexedDB that acts like WebStorage.

```js
const db = await Indexed.open("testdb");

await db.set("name", "John Doe");
await db.set("email", "johndoe@example.com");

const name = await db.get("name");
const email = await db.get("email");
console.log(name, email);

db.close();
```

## Installation

For server-side, install it with NPM:

```bash
npm install @creuserr/indexed
```

Then import it. Using `require` for example:
```javascript
const Indexed = require("@creuserr/indexed");
```

For client-side, import it using CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/creuserr/indexed@main/dist/indexed.min.js"></script>
```

## Documentation

### `Indexed` <kbd>class</kbd>

#### `open(name, version=1)` <kbd>static</kbd> <kbd>async</kbd>
Returns a promise. This method attempts to open a database.
If successful, an `Indexed.Database` instance will be returned.

```js
const db = await Indexed.open("testdb");
```

#### `delete(name)` <kbd>static</kbd> <kbd>async</kbd>
Returns a promise. This method attempts to delete a database.

```js
await Indexed.delete("testdb");
```

#### `all()` <kbd>static</kbd> <kbd>async</kbd>
Returns a promise. This method returns all the existing database.
If successful, a list of objects will be returned.
The objects would contain the following properties: name, version.

```js
await Indexed.all();
// [{ name: "testdb", version: 1 }]
```

#### `check(name, version=1)` <kbd>static</kbd> <kbd>async</kbd>
Returns a promise. This method attempts to check if the database follows ***Indexed scheme**.
If successful, a boolean will be returned.

> [!NOTE]
> This method attempts to open the database in order to check its scheme.

```js
await Indexed.check("testdb");
// true
```

### `Indexed.Database` <kbd>static</kbd> <kbd>class</kbd>

#### `set(key, value)` <kbd>async</kbd>
Returns a promise. This method attempts to update or create a data inside the database.

```js
await db.set("name", "John Doe");
```

#### `get(key, default_value)` <kbd>async</kbd>
Returns a promise. This method attempts to retrieve a data inside the database.
`default_value` will be returned if the key doesn't exist.

```js
await db.get("name");
// "John Doe"

await db.get("bio", "No bio found");
// "No bio found"
```

#### `all()` <kbd>async</kbd>
Returns a promise. This method attempts to retrieve all the data inside the database.
If successful, an object will be returned.

```js
await db.all();
// { name: "John Doe", email: "johndoe@example.com" }
```

#### `delete(key)` <kbd>async</kbd>
Returns a promise. This method attempts to delete a data from the database.

```js
await db.delete("name");
```

#### `close()` <kbd>async</kbd>
This method closes the database.

> [!IMPORTANT]
> If you are deleting a database, make sure to close its connection first.

```js
db.close();
// This method doesn't return a promise
// so it's unnecessary to use await
```

## Scheme

```
Database
└── Object Stores:
    └── "main"
        └── Indexes:
            ├── "key" (keyPath) (unique)
            └── "value"
```

## Fallbacks <kbd>v1.1.0</kbd>

Fallbacks are objects containing functions that will be triggered when the enviromment does not support indexed database.

By default, you can statically use Indexed methods. However, if you want to use fallbacks, you need to construct a new instance.

```javascript
const index = new Indexed();
```

Now, define fallback. This should be an object. Here is a template:

```javascript
index.fallback = {
  async all() {
    // ...
    return [{
      name: String,
      version: Number
    }, ...];
  },
  async check(db) {
    // ...
    return Boolean
  },
  async delete(db, version) {
    // ...
  },
  open: {
    async set(db, key, value) {
      // ...
    },
    async get(db, key, default_value) {
      // ...
    },
    async delete(db, key) {
      // ...
    },
    async all(db) {
      // ...
      return Object
    }
  }
}
```

> [!TIP]
> For consistent use, you should make the fallback functions as asynchronous.
> Since Indexed methods are asynchronous, fallbacks should also be asynchronous to prevent errors when using `then` and `catch` methods.

### Fallback for web storages

Indexed has a static function where you can generate a fallback object for web storages (localStorage and sessionStorage).

```javascript
const fallback = Indexed.fallbackForWebStorage(window.localStorage);
const index = new Indexed();
index.fallback = fallback;
// ...
```

### Fallback for objects

Indexed has a static function where you can generate a fallback object for objects.

```javascript
const database = {};
const getter = key => {
  return database[key];
}
const setter = (key, value) => {
  database[key] = value;
}

const fallback = Indexed.fallbackForObject(getter, setter);
const index = new Indexed();
index.fallback = fallback;
// ...
```

It follows this structure:

```javascript
{
  database_name: {
    key: value,
    key_2: value_2
    // ...
  },
  database_name_2: {
    key: value,
    key_2: value_2
    // ...
  }
}
```
