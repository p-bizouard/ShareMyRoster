#! /bin/bash

set -e

if [[ ! -z "${ENV_DEV}" ]]; then
    export COMMIT_SHA1=${CIRCLE_SHA1}
    export KUBECTL=./kubectl
else
    set -a
    source .env
    set +a

    export KUBECTL=kubectl.exe
fi

# since the only way for envsubst to work on files is using input/output redirection,
#  it's not possible to do in-place substitution, so we need to save the output to another file
#  and overwrite the original with that one.
envsubst < ./kubernetes/deployment.yml.template > ./build/kubernetes-deployment.yml

echo "$KUBERNETES_CLUSTER_CERTIFICATE" | base64 --decode > ./build/kubernetes-cert.crt

$KUBECTL \
  --kubeconfig=/dev/null \
  --server=$KUBERNETES_SERVER \
  --certificate-authority=./build/kubernetes-cert.crt \
  --token=$KUBERNETES_TOKEN \
  apply -f ./build/kubernetes-deployment.yml