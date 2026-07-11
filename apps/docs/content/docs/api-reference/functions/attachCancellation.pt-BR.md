---
layout: docs
title: "attachCancellation()"
---

[@saasdeep/fiscal](/docs/api-reference/index) / attachCancellation



```ts
function attachCancellation(nfeProcXml, cancelResponseXml): string;
```

Defined in: [complement.ts:130](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS/blob/c32859918d11f43537218f836329adb3d7693356/packages/fiscal/src/complement.ts#L130)

Attach a cancellation event response to an authorized nfeProc XML.
Anexa a resposta do evento de cancelamento ao XML autorizado nfeProc.

Insere o nó `<retEvento>` dentro do wrapper `<nfeProc>`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `nfeProcXml` | `string` |  |
| `cancelResponseXml` | `string` |  |

## Returns

`string`


