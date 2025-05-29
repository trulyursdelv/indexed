## :anchor: Reference

Reference is a utility class for manipulating an object quickly.

For example, you can easily modify a key from an object.

```javascript
const ref = Indexed.reference({
  auth: {
    organization: {
      name: "Foo Studio"
    }
  }
});

ref.set("auth/organization/name", "Bar Studio");
```

#### :rotating_light: Take Note

Reference is a high-level utility class. Therefore, it doesn't support automatic actions especially in removing data and processing keys.

To prevent incorrect mutation, always convert an empty keys into a root path (`/`). For example, `set("", 1)` should be `set("/", 1)`.

Additionally, to properly delete a data, you need to do some [further steps](#deleting-a-data).

### :package: Creating a new reference

To create a new reference, use the `Indexed.reference` method with your object.

```javascript
const ref = Indexed.reference({
  // ...
});
```

### :fountain_pen: Writing a data

To write a data, use the `set` method, with your key and value.

```javascript
const ref = Indexed.reference({
  foo: {
    bar: null
  }
});

ref.set("foo/bar", "baz");
```

### :mag_right: Reading a data

To write a data, use the `get` method, with your key, and optionally, default value.

```javascript
const ref = Indexed.reference({
  foo: {
    bar: "baz"
  }
});

ref.get("foo/bar", "Not found");
```

### :wastebasket: Deleting a data

To remove a data, use the method `remove` with your key. This will return a boolean whether you need to do it manually.

```javascript
const ref = Indexed.reference({
  foo: {
    bar: "baz"
  }
});

ref.remove("foo/bar");
```

Manual deletion only happens if the path is `/`. If it does, you need manually delete that object.

Here's an example of how to do manual deletion:

```javascript
let scope = {
  foo: "bar"
}

const ref = Indexed.reference(scope);

const shouldDelete = ref.remove("/");

if(shouldDelete) scope = null;
```
