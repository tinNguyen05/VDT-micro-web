pipeline {
    agent any

    environment {
        // Thông tin tài khoản
        DOCKER_USER = 'trtin2005'
        CONFIG_REPO_URL = 'github.com/tinNguyen05/VDT-micro-web-config.git'
        
        // Khai báo ID Credentials đã tạo ở bước 1
        DOCKER_CREDS = 'dockerhub-creds'
        GIT_CREDS = 'github-creds'
    }

    stages {
        stage('Check & Get Tag') {
            steps {
                script {
                    echo 'Đang kiểm tra Git Tag...'
                    // Lệnh này bắt tag hiện tại đang trỏ vào HEAD commit
                    env.GIT_TAG = sh(script: "git tag --points-at HEAD | head -n 1", returnStdout: true).trim()
                    
                    if (env.GIT_TAG == "") {
                        error('Không phát hiện Git Tag mới. Pipeline bị hủy (Abort) để tiết kiệm tài nguyên.')
                    }
                    echo "🚀 Đã bắt được sự kiện push tag mới: ${env.GIT_TAG}"
                }
            }
        }

        stage('Build Images (5 Microservices)') {
            steps {
                echo "Tiến hành build Docker Images cho phiên bản ${env.GIT_TAG}..."
                sh """
                    docker build -t ${DOCKER_USER}/api-gateway:${GIT_TAG} ./api-gateway
                    docker build -t ${DOCKER_USER}/frontend:${GIT_TAG} ./frontend
                    docker build -t ${DOCKER_USER}/order-service:${GIT_TAG} ./order-service
                    docker build -t ${DOCKER_USER}/product-service:${GIT_TAG} ./product-service
                    docker build -t ${DOCKER_USER}/user-service:${GIT_TAG} ./user-service
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo 'Login vào Docker Hub và push images...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'DOCKER_U', passwordVariable: 'DOCKER_P')]) {
                    sh """
                        echo \$DOCKER_P | docker login -u \$DOCKER_U --password-stdin
                        docker push ${DOCKER_USER}/api-gateway:${GIT_TAG}
                        docker push ${DOCKER_USER}/frontend:${GIT_TAG}
                        docker push ${DOCKER_USER}/order-service:${GIT_TAG}
                        docker push ${DOCKER_USER}/product-service:${GIT_TAG}
                        docker push ${DOCKER_USER}/user-service:${GIT_TAG}
                    """
                }
            }
        }

        stage('Update Config Repo') {
            steps {
                echo 'Clone Config Repo và update file values.yaml...'
                withCredentials([usernamePassword(credentialsId: "${GIT_CREDS}", usernameVariable: 'GIT_U', passwordVariable: 'GIT_P')]) {
                    sh """
                        # Setup user cho Git
                        git config --global user.email "jenkins-ci@viettel.com.vn"
                        git config --global user.name "Jenkins GitOps Bot"

                        # Xóa thư mục cũ nếu có để tránh lỗi
                        rm -rf VDT-micro-web-config
                        
                        # Clone repo config với xác thực PAT
                        git clone https://${GIT_U}:${GIT_P}@${CONFIG_REPO_URL}
                        cd VDT-micro-web-config

                        # Dùng lệnh sed để thay thế toàn bộ chữ 'tag: v...' thành tag mới
                        # Lệnh này sẽ tìm chữ 'tag:' và ghi đè giá trị phía sau
                        sed -i "s/tag: .*/tag: ${GIT_TAG}/g" crud-app/values.yaml

                        echo 'Nội dung file values.yaml sau khi thay đổi:'
                        cat crud-app/values.yaml

                        # Commit và Push ngược lên Config Repo
                        git add crud-app/values.yaml
                        git commit -m "🔁 CI/CD: Tự động cập nhật image tag lên ${GIT_TAG} cho 5 services"
                        git push origin main
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo 'Dọn dẹp Workspace sau khi hoàn thành...'
            cleanWs()
            // Logout Docker để đảm bảo bảo mật
            sh 'docker logout'
        }
    }
}