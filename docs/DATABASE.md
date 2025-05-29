## Managing Database

After opening a database, an instance of database will be produced. It consist of asynchronous methods.

All of these methods supports [referencing](REFERENCE.md).

### :fountain_pen: Writing a data

To write a data, use the method `set` with your key, value, and optionally, time-to-live in milliseconds.

```javascript
const index = await Indexed.open("my-database");

const ttl = 5e4; // 5 seconds
await index.set("foo", "bar", ttl);
```

### :mag_right: Reading a data

To read a data, use the method `get` with your key and optionally, default value.

```javascript
const index = await Indexed.open("my-database");

const data = await index.get("foo", "Foo does not exist.");
console.log(data);
```

### :file_folder: Check if a data exists

To check if a data exists, use the method `has` with your key.

```javascript
const index = await Indexed.open("my-database");

console.log(await index.has("foo"));
```

### :cookie: Cookies

Unlike `Indexed.cookie`, an instance of cookie has the ability to sync your data from your database.

To sync a data to the cookie, use the method `sync` with your key, and optionally, alias name.

```javascript
const index = await Indexed.open("my-database");

// Sync the data "foo" into a cookie named "foo-cookie"
index.cookie.sync("foo", "foo-cookie");
```
