@echo off
echo [병원 API 서버 시작] 포트 8081
cd /d C:\jihyeon\team-healthcare-project-voidraya\backend

REM 환경 설정 백업 및 병원 API 전용으로 변경
copy src\main\resources\application.properties src\main\resources\application.properties.backup

echo spring.application.name=backend > src\main\resources\application.properties.hospital
echo. >> src\main\resources\application.properties.hospital
echo # 병원 API 테스트를 위해 데이터베이스 비활성화 >> src\main\resources\application.properties.hospital
echo spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration >> src\main\resources\application.properties.hospital
echo. >> src\main\resources\application.properties.hospital
echo jwt.secret=mySecretKeyThatIsVeryLongAndSecureForJWTTokenGeneration123456789 >> src\main\resources\application.properties.hospital
echo jwt.expiration=86400000 >> src\main\resources\application.properties.hospital
echo. >> src\main\resources\application.properties.hospital
echo openapi.service-key=gPtV22mJezBSA5%%2Bg8qhMQPCcx%%2F8yr7SBcca0o4dmBLjzvpKuKfV%%2FEwXTb%%2Bq3Ps3buuhRP9sOlhqZSCSPMLoKzg%%3D%%3D >> src\main\resources\application.properties.hospital
echo. >> src\main\resources\application.properties.hospital
echo spring.jackson.serialization.fail-on-empty-beans=false >> src\main\resources\application.properties.hospital
echo. >> src\main\resources\application.properties.hospital
echo server.port=8081 >> src\main\resources\application.properties.hospital

copy src\main\resources\application.properties.hospital src\main\resources\application.properties

echo 병원 API 전용 설정으로 서버 시작...
gradlew.bat bootRun

REM 원래 설정 복구
copy src\main\resources\application.properties.backup src\main\resources\application.properties

pause