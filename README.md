# Exante ![CI Status](https://github.com/b2broker/exante-node/workflows/CI/badge.svg) [![GitHub version](https://badge.fury.io/gh/b2broker%2Fexante-node.svg)](https://badge.fury.io/gh/b2broker%2Fexante) [![Known Vulnerabilities](https://snyk.io/test/github/b2broker/exante-node/badge.svg)](https://snyk.io/test/github/b2broker/exante-node) [![Coverage Status](https://coveralls.io/repos/github/b2broker/exante-node/badge.svg?branch=master)](https://coveralls.io/github/b2broker/exante-node?branch=master) [![languages](https://img.shields.io/github/languages/top/b2broker/exante-node.svg)](https://github.com/b2broker/exante-node) ![node](https://img.shields.io/node/v/exante-node) [![npm downloads](https://img.shields.io/npm/dt/exante-node.svg)](https://www.npmjs.com/package/exante-node) [![license](https://img.shields.io/github/license/b2broker/exante-node.svg)](https://github.com/b2broker/exante-node/blob/master/LICENSE)

Node.js library for Exante's [API](https://api-live.exante.eu/api-docs/).

## Installation

```bash
npm install exante
```

## Usage

The library currently supports the following API versions: `2.0` and `3.0` (see [API versions](https://api-live.exante.eu/api-docs/#section/API-versions)).

### RestClient

```typescript
import { RestClient } from "exante";
const client_id = "d0c5340b-6d6c-49d9-b567-48c4bfca13d2";
const app_id = "6cca6a14-a5e3-4219-9542-86123fc9d6c3";
const shared_key = "5eeac64cc46b34f5332e5326/CHo4bRWq6pqqynnWKQg";
const demo = false;
const client = new RestClient({ client_id, app_id, shared_key, demo });
```

- [`getAccounts`](https://api-live.exante.eu/api-docs/#operation/getAccounts)

```typescript
const version = "3.0";
const accounts = await client.getAccounts({ version });
```
