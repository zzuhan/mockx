MockX

目前包含了 middleware, mock 两种类型


# mock

```
require('mockx').mock(tpl[, data]);

var userInfo = require('mockx').mock({
	"name": "xxx",
	"avatar": "@image(200x200)",
	"age|1-100.1-10": 2,
	"blog": "@url"
});


```

# middleware

作为配合plug-base的middleware

