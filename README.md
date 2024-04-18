# dxeco-runner-v2

```sh
deno task dev
```

or

```sh
deno eval "(await import('./mod.ts')).runner({ name: 'TestRunner2', apiKey: 'dummy', apiUrl: new URL('http://localhost:4000/api'), interval: 5000, timeout: 10000 });"
```
