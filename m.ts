import { join } from "jsr:@std/url";

// deno compile で jsr:@std/url を import すると処理が進まない!
console.log("start!");
console.log(join("a", "b"));
