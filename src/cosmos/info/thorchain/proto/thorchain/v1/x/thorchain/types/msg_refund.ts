/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { ObservedTx } from "./type_observed_tx";

export const protobufPackage = "types";

export interface MsgRefundTx {
  tx?: ObservedTx | undefined;
  inTxId: string;
  signer: Uint8Array;
}

function createBaseMsgRefundTx(): MsgRefundTx {
  return { tx: undefined, inTxId: "", signer: new Uint8Array(0) };
}

export const MsgRefundTx = {
  encode(message: MsgRefundTx, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tx !== undefined) {
      ObservedTx.encode(message.tx, writer.uint32(10).fork()).ldelim();
    }
    if (message.inTxId !== "") {
      writer.uint32(18).string(message.inTxId);
    }
    if (message.signer.length !== 0) {
      writer.uint32(26).bytes(message.signer);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRefundTx {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRefundTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.tx = ObservedTx.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.inTxId = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.signer = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgRefundTx {
    return {
      tx: isSet(object.tx) ? ObservedTx.fromJSON(object.tx) : undefined,
      inTxId: isSet(object.inTxId) ? globalThis.String(object.inTxId) : "",
      signer: isSet(object.signer) ? bytesFromBase64(object.signer) : new Uint8Array(0),
    };
  },

  toJSON(message: MsgRefundTx): unknown {
    const obj: any = {};
    if (message.tx !== undefined) {
      obj.tx = ObservedTx.toJSON(message.tx);
    }
    if (message.inTxId !== "") {
      obj.inTxId = message.inTxId;
    }
    if (message.signer.length !== 0) {
      obj.signer = base64FromBytes(message.signer);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgRefundTx>, I>>(base?: I): MsgRefundTx {
    return MsgRefundTx.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgRefundTx>, I>>(object: I): MsgRefundTx {
    const message = createBaseMsgRefundTx();
    message.tx = (object.tx !== undefined && object.tx !== null) ? ObservedTx.fromPartial(object.tx) : undefined;
    message.inTxId = object.inTxId ?? "";
    message.signer = object.signer ?? new Uint8Array(0);
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Long ? string | number | Long : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
