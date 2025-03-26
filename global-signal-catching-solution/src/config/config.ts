// TODO handle multiple stages

function getCloudConfig() {
  return {
    AWS_REGION: "eu-central-1",
    STAGE: "dev",
    SERVICE: "generated-process", // TODO via template
    TEMPORAL_USE_CLOUD: false, // if false then use local docker-compose
    TEMPORAL_WORKER_QUEUE: "generated-process-queue", // TODO via template
    TEMPORAL_KMS_ENCRYPTION_KEY: "yet-unused", // TODO
    TEMPORAL_NAMESPACE: "bpm-conversion-reference.zkhtn", // https://cloud.temporal.io/namespaces
    TEMPORAL_CLOUD_URL: "eu-central-1.aws.api.temporal.io:7233", // https://cloud.temporal.io/namespaces/bpm-conversion-reference.zkhtn
    TEMPORAL_PRIVATE_LINK_ADDRESS: "yet-unused", // TODO
    TEMPORAL_CLIENT_CERT_PAIR_PARAMETER: {
      cert: "TODO",
      key: "TODO",
    },
  };
}

export function getLocalConfig() {
  return {
    STAGE: "dev",
    TEMPORAL_WORKER_QUEUE: "local-queue", // TODO via template
    TEMPORAL_NAMESPACE: "default", // https://cloud.temporal.io/namespaces
    TEMPORAL_USE_CLOUD: false,
  };
}

export default getCloudConfig;
