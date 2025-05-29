(async () => {

/**
  * Normalize a path and split it into two parts: Leading segment and trailing segments.
  * 
  * For example:
  * foo/bar/0/baz -> [foo, bar/0/baz]
  */
function normalize(path) {
  const segments = path.split("/").map(s => s.trim()).filter(s => s.length > 0);
  const lead = segments.shift();
  const trail = segments.join("/");
  return [lead, trail.length > 0 ? trail : "/"];
}

/**
 * Reference allows navigating through an object.
 * 
 * However, the path should only be the trailing segments and not include the leading one.
 */
class Reference {
  constructor(scope) {
    this.scope = scope || {};
  }
  
  set(path, value) {
    if(path == "/") return this.scope = value;
    
    const parts = path.trim().split("/");
    const target = parts.pop();
    let ref = this.scope;
    for(let i = 0; i < parts.length; i++) {
      const key = +parts[i] || parts[i];
      if(ref[key] === undefined) ref[key] = {};
      ref = ref[key];
    }
    ref[target] = value;
    return this.scope;
  }
  
  get(path, placeholder) {
    if(path == "/") return this.scope;
  
    const parts = path.trim().split("/");
    return parts.reduce((acc, key) => acc?.[+key || key], this.scope) || placeholder;
  }
  
  /**
   * Reference cannot handle the database directly. Therefore, when using remove, manual deletion to the data is required.
   * 
   * This method returns a boolean whether the removal was successful or needs manual deletion.
   * 
   * For an instance, if this method returns false, using Database.#delete is needed.
   */
  remove(path) {
    if(path == "/") return false;
    
    const parts = path.trim().split("/");
    const target = parts.pop();
    let ref = this.scope;
    for(let i = 0; i < parts.length; i++) {
      const key = +parts[i] || parts[i];
      ref = ref[key];
    }
    delete ref[target];
    return true;
  }
}

class Cookie {
  /**
   * Since static methods are inaccessible on an instance, manually define them.
   */
  set = Cookie.set;
  get = Cookie.get;
  remove = Cookie.remove;
  
  constructor(index) {
    this.index = index;
  }
  
  /**
   * Synchronize a data from database into a cookie.
   * This comes helpful for cookie-reliant features like HTTP requests.
   */
  async sync(from, alias) {
    if(alias == null) alias = normalize(from)[0];
    
    const data = await this.index.get(from);
    Cookie.set(alias, data);
  }
  
  static set(key, value, ttl=0) {
    const encoded = encodeURIComponent(JSON.stringify(value));
    const cookie = `${encodeURIComponent(key)}=${encoded}; expires=Fri, 01 Jan 2100 00:00:00 GMT; path=/`;
    document.cookie = cookie;
  }
  
  static get(key, placeholder=null) {
    const cookies = document.cookie.split("; ");
    for(const cookie of cookies) {
      const [k, v] = cookie.split("=");
      if(decodeURIComponent(k) == key) {
        try {
          return JSON.parse(decodeURIComponent(v));
        } catch {
          return placeholder;
        }
      }
    }
    return placeholder;
  }
  
  static remove(key) {
    document.cookie = `${encodeURIComponent(key)}=; max-age=0; path=/`;
  }
}

class Database {
  constructor(index) {
    this.index = index;
    this.cookie = new Cookie(index);
  }
  
  /**
   * Explicitly write a data into the database.
   * This cannot be used directly since it does not support nested keys.
   */
  async #write(key, value=null, ttl=Infinity) {
    const self = this;
    return new Promise((resolve, reject) => {
      const transaction = this.index.transaction(["main"], "readwrite");
      const store = transaction.objectStore("main");
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if(result != null) {
          result.value = value;
          result.ttl = ttl;
          store.put(result);
        } else {
          store.put({ key, value, ttl });
        }
        resolve(self);
      }
      request.onerror = () => {
        reject(request.error);
      }
    });
  }
  
  /**
   * Explicitly read a data from the database.
   * This cannot be used directly since it does not support nested keys.
   */
  async #read(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.index.transaction(["main"], "readonly");
      const store = transaction.objectStore("main");
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result);
      }
      request.onerror = () => {
        reject(request.error);
      }
    });
  }
  
  /**
   * Explicitly delete a data.
   * This cannot be used directly since it does not support nested keys.
   */
  async #delete(key) {
    const self = this;
    return new Promise((resolve, reject) => {
      const transaction = this.index.transaction(["main"], "readwrite");
      const store = transaction.objectStore("main");
      const request = store.delete(key);
      request.onsuccess = () => {
        resolve(self);
      }
      request.onerror = () => {
        reject(request.error);
      }
    });
  }
  
  async all() {
    return new Promise((resolve, reject) => {
      const transaction = this.index.transaction(["main"], "readonly");
      const store = transaction.objectStore("main");
      const request = store.getAll();
      request.onsuccess = () => {
        const data = {};
        const result = request.result;
        result.forEach(item => {
          data[item.key] = item;
        });
        resolve(data);
      }
      request.onerror = () => {
        reject(request.error);
      }
    });
  }
  
  async has(path) {
    // Create a temporary class to determine the inexistence of a data.
    class None {};
    
    // Create a None instance for the placeholder.
    // Once the data does not exist, the placeholder will be returned as is.
    const data = this.get(path, new None());
    
    // Returns false if the data is an instance of None.
    return !(data instanceof None);
  }
  
  async set(path, value, ttl=Infinity) {
    const [lead, trail] = normalize(path);
    
    // Read the full data using the leading segment.
    const data = await this.#read(lead);
    
    // Create a new Reference with the full data.
    const ref = new Reference(data?.value);
    
    // Write into the database with a modified value (authored by the reference) and a time-to-live.
    await this.#write(lead, ref.set(trail, value), Date.now() + ttl);
    
    return this;
  }
  
  async get(path, placeholder) {
    const [lead, trail] = normalize(path);
    
    const data = await this.#read(lead);
    if(!data) return placeholder;
    
    // If the time-to-live has been expired, delete the data and return instead.
    if(data.ttl < Date.now()) {
      await this.remove(lead);
      return placeholder;
    }
    
    const ref = new Reference(data?.value);
    return ref.get(trail, placeholder);
  }
  
  async remove(path) {
    const [lead, trail] = normalize(path);
    
    const data = await this.#read(lead);
    if(!data) return this;
    
    const ref = new Reference(data.value);
    
    // Delete the whole data if no trailing segment is provided.
    if(trail == "/") this.#delete(lead);
    
    // Otherwise, remove the data from the reference instead.
    else this.#write(lead, ref.remove(trail), data.ttl);
    
    return this;
  }
  
  async keys() {
    const whole = await this.all();
    return Object.keys(whole);
  }
  
  async clear() {
    const keys = await this.keys();
    for(const key of keys) {
      await this.remove(key);
    }
  }
}

class Indexed {
  static cookie = Cookie;
  
  static reference(scope) {
    return new Reference(scope);
  }
  
  static async open(name, version=1) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(name, version);
      request.onupgradeneeded = evt => {
        const db = evt.target.result;
        const main = db.createObjectStore("main", { keyPath: "key" });
        main.createIndex("value", "value", { unique: false });
        main.createIndex("ttl", "ttl", { unique: false });
      }
      request.onsuccess = async evt => {
        resolve(new Database(evt.target.result));
      }
      request.onerror = evt => {
        reject(evt.target.error);
      }
    });
  }
  
  static async has(name, version=1) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(name, version);
      request.onsuccess = function(event) {
        const db = event.target.result;
        if(!db.objectStoreNames.contains("main")) {
          return resolve(false);
        }
        const transaction = db.transaction("main");
        const store = transaction.objectStore("main");
        if(["key", "value", "ttl"].some(key => !store.indexNames.contains(key))) {
          return resolve(false);
        }
        resolve(true);
      }
      request.onerror = evt => {
        reject(evt.target.error);
      }
    });
  }
  
  static async delete(name, version=1) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(name, version);
      request.onsuccess = evt => {
        resolve();
      }
      request.onerror = evt => {
        reject(evt.target.error);
      }
      request.onblocked = evt => {
        reject(evt.target.error);
      }
    });
  }
  
  static async all() {
    const list = await window.indexedDB.databases();
    return list.map(item => item.name);
  }
}

window.Indexed = Indexed;

})();