# fastify-debug-headers

[![Package](https://img.shields.io/npm/v/fastify-debug-headers.svg)](https://npm.im/fastify-debug-headers)
[![Dependencies](https://img.shields.io/librariesio/release/npm/fastify-debug-headers)](https://libraries.io/npm/fastify-debug-headers)
[![Build](https://github.com/ShogunPanda/fastify-debug-headers/workflows/CI/badge.svg)](https://github.com/ShogunPanda/fastify-debug-headers/actions?query=workflow%3ACI)
[![Coverage](https://img.shields.io/codecov/c/gh/ShogunPanda/fastify-debug-headers?token=sIpECHM8Wb)](https://codecov.io/gh/ShogunPanda/fastify-debug-headers)

Fastify plugin to add response debug headers.

http://sw.cowtech.it/fastify-debug-headers

## Installation

Just run:

```bash
npm install fastify-debug-headers --save
```

## Usage

Register as a plugin, optional providing any of the following options:

- `prefix`: The prefix to use for the headers. Default is `Fastify`.
- `servedBy`: If to add a `X-Fastify-Served-By` header with the hostname of the machine which processed the request. Default is `true`.
- `requestId`: If to add a `X-Fastify-Request-Id` header with the request id. Default is `true`.
- `responseTime`: If to add a `X-Fastify-Response-Time` header with the response time in milliseconds. Default is `true`.

Once registered, the plugin will add the headers as described above.

## Contributing to fastify-debug-headers

- Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet.
- Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it.
- Fork the project.
- Start a feature/bugfix branch.
- Commit and push until you are happy with your contribution.
- Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.

## Copyright

Copyright (C) 2019 and above Shogun (shogun@cowtech.it).

Licensed under the ISC license, which can be found at https://choosealicense.com/licenses/isc.
