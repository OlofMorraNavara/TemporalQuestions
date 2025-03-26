import { SSM } from "@aws-sdk/client-ssm";
import type { NativeConnectionOptions } from "@temporalio/worker";
import getConfig from "./config";

async function getClientCertPair(): Promise<
  | {
    crt: Buffer;
    key: Buffer;
  }
  | undefined
> {
  const ssmClient = new SSM({});
  const config = getConfig();

  const { Parameter: { Value: cert } = {} } = await ssmClient.getParameter({
    Name: config.TEMPORAL_CLIENT_CERT_PAIR_PARAMETER.cert,
    WithDecryption: true,
  });
  const { Parameter: { Value: key } = {} } = await ssmClient.getParameter({
    Name: config.TEMPORAL_CLIENT_CERT_PAIR_PARAMETER.key,
    WithDecryption: true,
  });

  return {
    crt: Buffer.from(cert ?? "", "utf8"),
    key: Buffer.from(key ?? "", "utf8"),
  };
}

let cachedConnectionOptions: NativeConnectionOptions | undefined;

export async function getConnectionOptions(): Promise<NativeConnectionOptions> {
  if (cachedConnectionOptions) {
    return cachedConnectionOptions;
  }
  const config = getConfig();

  if (!config.TEMPORAL_USE_CLOUD) {
    return {};
  }

  if (config.TEMPORAL_PRIVATE_LINK_ADDRESS) {
    cachedConnectionOptions = {
      address: config.TEMPORAL_PRIVATE_LINK_ADDRESS,
      tls: {
        serverNameOverride: config.TEMPORAL_CLOUD_URL,
        clientCertPair: await getClientCertPair(),
      },
    };

    return cachedConnectionOptions;
  }

  if (!config.TEMPORAL_PRIVATE_LINK_ADDRESS) {
    cachedConnectionOptions = {
      address: config.TEMPORAL_CLOUD_URL,
      tls: {
        clientCertPair: await getClientCertPair(),
      },
    };

    return cachedConnectionOptions;
  }

  return {};
}
