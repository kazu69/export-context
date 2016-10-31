# Using tape example

> Example of a test that use the export-context in the unit test that uses a [tape](https://github.com/substack/tape)

```sh
npm i tape
node ./test.js

TAP version 13
# greet
ok 1 should be equal
# setText
ok 2 should be equal
# getText
ok 3 should be equal

1..3
# tests 3
# pass  3

# ok
```
