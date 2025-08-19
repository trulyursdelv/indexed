/**
 * Indexed v0
 * https://github.com/trulyursdelv/indexed
 *
 * Released under the CC0-1.0 license
 * https://github.com/trulyursdelv/indexed#license
 *
 * Date: 2025-08-19
 */

(() => {

class Database {
  constructor(factory) {
    this.factory = factory;
  }
  
  async set(key, value) {
    const factory = this.factory;
    return new Promise((resolve, reject) => {
      const transaction = factory.transaction(["main"], "readwrite");
      const store = transaction.objectStore("main");
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result != null) {
          result.value = value;
          store.put(result);
        } else {
          store.put({ key, value });
        }
        resolve(this);
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async get(key) {
    const factory = this.factory;
    return new Promise((resolve, reject) => {
      const transaction = factory.transaction(["main"], "readonly");
      const store = transaction.objectStore("main");
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : undefined);
      request.onerror = () => reject(request.error);
    });
  }
  
  async delete(key) {
    const factory = this.factory;
    return new Promise((resolve, reject) => {
      const transaction = factory.transaction(["main"], "readwrite");
      const store = transaction.objectStore("main");
      const request = store.delete(key);
      request.onsuccess = () => resolve(this);
      request.onerror = () => reject(request.error);
    });
  }
  
  async has(key) {
    const factory = this.factory;
    return new Promise((resolve, reject) => {
      const transaction = factory.transaction(["main"], "readonly");
      const store = transaction.objectStore("main");
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result != null);
      request.onerror = () => reject(request.error);
    });
  }
  
  async all() {
    const factory = this.factory;
    return new Promise((resolve, reject) => {
      const transaction = factory.transaction(["main"], "readonly");
      const store = transaction.objectStore("main");
      const request = store.getAll();
      request.onsuccess = () => {
        const result = {};
        request.result.forEach(item => {
          result[item.key] = item.value;
        });
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async clear() {
    const factory = this.factory;
    return new Promise((resolve, reject) => {
      const transaction = factory.transaction(["main"], "readwrite");
      const store = transaction.objectStore("main");
      const request = store.clear();
      request.onsuccess = () => resolve(this);
      request.onerror = () => reject(request.error);
    });
  }
}

class Indexed {
  static async open(name, version=1) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(name, version);
      request.onupgradeneeded = evt => {
        const db = evt.target.result;
        const main = db.createObjectStore("main", { keyPath: "key" });
        main.createIndex("value", "value", { unique: false });
      };
      request.onsuccess = evt => {
        resolve(new Database(evt.target.result));
      };
      request.onerror = evt => reject(evt.target.error);
    });
  }

  static async has(name, version=1) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(name, version);
      request.onsuccess = evt => {
        const db = evt.target.result;
        if(!db.objectStoreNames.contains("main")) {
          return resolve(false);
        }
        const transaction = db.transaction("main", "readonly");
        const store = transaction.objectStore("main");
        if(!store.indexNames.contains("value")) return resolve(false);
        resolve(true);
      };
      request.onerror = evt => reject(evt.target.error);
    });
  }

  static async delete(name) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = evt => reject(evt.target.error);
      request.onblocked = evt => reject(new Error("Delete blocked"));
    });
  }
}

window.Indexed = Indexed;

})();