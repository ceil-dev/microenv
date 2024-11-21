# Microenv

_Minimalistic state management with simple interface_

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Example](#example)
5. [License](#license)

---

## Overview

MicroEnv is a simple and lightweight state management library designed to handle application state with minimal complexity. It operates using three core methods: "get", "set", and "call", allowing you to easily retrieve, update, and manipulate state. The "get" method can also return a promise when used with a "next" flag, which enables asynchronous subscription to state changes and simplifies reactivity.

---

## Installation

```bash
# Clone the repository
npm install @ceil-dev/microenv
```

---

### Usage

```javascript
import {microEnv} from '@ceil-dev/microenv';
```

---

### Example

```typescript
import {microEnv} from '@ceil-dev/microenv';

const run = async () => {
  const myEnv = microEnv(
    {
      propA: 1,
      propB: 'two',
      propC: (payload, caller) => {
        return { message: `Hello ${payload}`, caller };
      },
    },
    { id: 'myEnv' }
  );

  console.log('myEnv propA value:', myEnv.get('propA'));

  myEnv
    .get('propB', 'someCallerId', true)
    .then((v) => console.log('myEnv new propB value:', v));

  console.log('myEnv propC call result:', myEnv.face.propC('World'));

  setTimeout(() => {
    myEnv.face.propB = 68;
  }, 2000);
};

run().catch(console.warn);
```

---

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
