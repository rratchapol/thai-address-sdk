export type AddressSdk = typeof import("thai-address-sdk");

let pendingSdk: Promise<AddressSdk> | undefined;

export function loadSdk(): Promise<AddressSdk> {
  pendingSdk ??= import("thai-address-sdk").catch((error: unknown) => {
    pendingSdk = undefined;
    throw error;
  });
  return pendingSdk;
}
