/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { PubKeySet } from "../../../common/common";

export const protobufPackage = "types";

export interface MsgSetNodeKeys {
  pubKeySetSet?: PubKeySet | undefined;
  validatorConsPubKey: string;
  signer: Uint8Array;
}

function createBaseMsgSetNodeKeys(): MsgSetNodeKeys {
  return { pubKeySetSet: undefined, validatorConsPubKey: "", signer: new Uint8Array(0) };
}

export const MsgSetNodeKeys = {
  encode(message: MsgSetNodeKeys, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pubKeySetSet !== undefined) {
      PubKeySet.encode(message.pubKeySetSet, writer.uint32(10).fork()).ldelim();
    }
    if (message.validatorConsPubKey !== "") {
      writer.uint32(18).string(message.validatorConsPubKey);
    }
    if (message.signer.length !== 0) {
      writer.uint32(26).bytes(message.signer);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetNodeKeys {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetNodeKeys();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.pubKeySetSet = PubKeySet.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.validatorConsPubKey = reader.string();
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

  fromJSON(object: any): MsgSetNodeKeys {
    return {
      pubKeySetSet: isSet(object.pubKeySetSet) ? PubKeySet.fromJSON(object.pubKeySetSet) : undefined,
      validatorConsPubKey: isSet(object.validatorConsPubKey) ? globalThis.String(object.validatorConsPubKey) : "",
      signer: isSet(object.signer) ? bytesFromBase64(object.signer) : new Uint8Array(0),
    };
  },

  toJSON(message: MsgSetNodeKeys): unknown {
    const obj: any = {};
    if (message.pubKeySetSet !== undefined) {
      obj.pubKeySetSet = PubKeySet.toJSON(message.pubKeySetSet);
    }
    if (message.validatorConsPubKey !== "") {
      obj.validatorConsPubKey = message.validatorConsPubKey;
    }
    if (message.signer.length !== 0) {
      obj.signer = base64FromBytes(message.signer);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSetNodeKeys>, I>>(base?: I): MsgSetNodeKeys {
    return MsgSetNodeKeys.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MsgSetNodeKeys>, I>>(object: I): MsgSetNodeKeys {
    const message = createBaseMsgSetNodeKeys();
    message.pubKeySetSet = (object.pubKeySetSet !== undefined && object.pubKeySetSet !== null)
      ? PubKeySet.fromPartial(object.pubKeySetSet)
      : undefined;
    message.validatorConsPubKey = object.validatorConsPubKey ?? "";
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
