pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        REGISTRY      = "192.168.0.5:6901"
        IMAGE_NAME    = "msa4/team4/client"          // <변경필요>
        CLONE_NAME    = "k8s-manifests"
        MANIFEST_REPO = "github.com/ByungjooPark/k8s-manifests.git"  // <변경필요>
        MANIFEST_PATH = "msa4/team4/client"          // <변경필요>
        IMAGE_TAG     = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Image') {
            steps {
                sh """
                    docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
                    docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Update Manifest') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'meerkat-token', // <변경 필요>
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh """
                        git clone https://${GIT_USER}:${GIT_TOKEN}@${MANIFEST_REPO} ${CLONE_NAME}
                        cd ${CLONE_NAME}/${MANIFEST_PATH}
                        sed -i "s|image: ${REGISTRY}/${IMAGE_NAME}:.*|image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}|" deployment.yaml
                        git config user.email "meerkat@ci"
                        git config user.name "meerkatCi"
                        git commit -am "Deploy ${IMAGE_NAME}:${IMAGE_TAG}"
                        git push
                    """
                }
            }
        }
    }

    post {
        always {
            sh """
                rm -rf ${CLONE_NAME}
            """
            cleanWs()
        }
    }
}