## :cookie: Cookie

Cookie is accessible through `Indexed.cookie` and the property `cookie` from a database instance.

Unlike databases, Cookie does not support [referencing](REFERENCE.md). If you want a workaround, you need to manually utilize a reference.

### :fountain_pen: Writing a data

To write a data, use the method `set` with your key and value.

```javascript
Indexed.cookie.set("foo", "bar");
```

> [!NOTE]
> Cookie does not have time-to-live support. Therefore, any data written will be technically stored forever.

### :file_folder: Reading a data

To read a data, use the method `get` with your key, and optionally, default value.

```javascript
Indexed.cookie.get("foo", "Foo does not exist");
```

### :wastebasket: Deleting a data

To delete a data, use the method `remove` with your key.

```javascript
Indexed.remove("foo");
```

### :link: Synchronize a data

To synchronize a data from the database into a cookie, use the `sync` method, with your database key, and optionally, alias name.

```javascript
const index = await Indexed.open("my-database");

// This will sync "foo" into a cookie named "foo-cookie"
await index.sync("foo", "foo-cookie");
```

> [!NOTE]
> This method is inaccessible on `Indexed.cookie`.
