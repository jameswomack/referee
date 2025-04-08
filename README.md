# referee

## Example output

<img width="1270" alt="Screenshot 2025-04-08 at 4 38 24 AM" src="https://github.com/user-attachments/assets/5f2daf86-85cf-4c65-aa1f-fd648f58a403" />

```sh
`bound parse` *3* milliseconds
`bound ancestor` *345* microseconds
`bound reconstructObjectExpression` *14* microseconds
`bound reconstructObjectExpression` *3* microseconds
`bound reconstructObjectExpression` *1* microseconds
`bound reconstructObjectExpression` *1* microseconds
`bound reconstructObjectExpression` *917* nanoseconds
`bound reconstructObjectExpression` *1* microseconds
`bound reconstructObjectExpression` *4* microseconds
`bound reconstructObjectExpression` *1* microseconds
`bound reconstructObjectExpression` *750* nanoseconds
`bound reconstructObjectExpression` *542* nanoseconds
`bound reconstructObjectExpression` *542* nanoseconds
`bound reconstructObjectExpression` *500* nanoseconds
`bound reconstructObjectExpression` *500* nanoseconds
`bound reconstructObjectExpression` *375* nanoseconds
`bound reconstructObjectExpression` *500* nanoseconds
`bound reconstructObjectExpression` *792* nanoseconds
`bound reconstructObjectExpression` *500* nanoseconds
`bound reconstructObjectExpression` *416* nanoseconds
`bound reconstructObjectExpression` *1* microseconds
`bound reconstructObjectExpression` *500* nanoseconds
`bound reconstructObjectExpression` *750* nanoseconds
`bound simple` *778* microseconds
`bound reconstructObjectExpression` *750* nanoseconds
`bound simple` *78* microseconds
`bound simple` *109* microseconds

The external method call report consists of:  [
  { object: 'axios', method: 'get', count: 1 },
  { object: 'console', method: 'log', count: 4 },
  { object: 'console', method: 'error', count: 1 },
  { object: 'document', method: 'querySelector', count: 1 },
  { object: 'window', method: 'addEventListener', count: 1 },
  {
    object: 'navigator.geolocation',
    method: 'getCurrentPosition',
    count: 1
  },
  { object: 'window.location', method: 'toString', count: 1 },
  { object: 'MyOtherClass', method: 'methodB', count: 1 },
  {
    object: 'sn_glider_ide.language.ScopedCodeEvaluator',
    method: 'evaluate',
    count: 1
  }
] 


The external declarations consist of:  [
  'axios',
  'console',
  'document',
  'window',
  'navigator.geolocation',
  'window.location',
  'MyOtherClass',
  'sn_glider_ide.language.ScopedCodeEvaluator'
] 

✔ parse function (externalDeclarations) (7.295416ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9.986791
```
