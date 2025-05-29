## Getting Started

Indexed can be access through `window.Indexed`. It consists of static methods and static properties.

### :package: Opening a database

To open a database, use the method `open` with your database name. This method returns an instance of [database](DATABASE.md).

```javascript
const db = await Indexed.open("my-database");
```

### :file_folder: Checking if a database exist

To check if a database exist and passed the criteria, use the method `has` with your database name. This method returns a boolean.

```javascript
await Indexed.has("my-database");
```

Indexed includes a criteria to verify whether its indexes match all those used by Indexed, in order to be considered as existing.

This is required to prevent colliding with databases that Indexed didn't made.

### :wastebasket: Deleting a database

To delete a database, use the method `delete` with your database name.

> [!IMPORTANT]
> This method does not undergo the criteria, which means even databases that Indexed didn't made could also be deleted.

```javascript
await Indexed.delete("my-database");
```

### :sparkles: Cookies and References

Indexed has two static utilities that could be used even without a database instance.

To access the [cookies](COOKIE.md), use the property `cookie`.

```javascript
Indexed.cookie
```

To create a new [reference](REFERENCE.md), use the `reference` method with your object.

```javascript
const ref = Indexed.reference({
  // ...
});
```
