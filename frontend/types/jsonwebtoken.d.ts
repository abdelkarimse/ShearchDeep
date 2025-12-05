declare module "jsonwebtoken" {
  export function decode(
    token: string,
    options?: any
  ): Record<string, unknown> | null;
  export function sign(
    payload: any,
    secretOrPrivateKey: string,
    options?: any
  ): string;
  export function verify(
    token: string,
    secretOrPublicKey: string,
    options?: any
  ): Record<string, unknown>;
}
