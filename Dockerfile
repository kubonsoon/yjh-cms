# 렌더 전산망 표준 리눅스 공식 PHP + Apache 이미지 주입
FROM php:8.2-apache

# 반응형 대문 및 자원망 자산 전체를 웹 서버 도큐먼트 루트(html)로 통째로 복사
COPY . /var/www/html/

# 사내 보안 전산망을 위해 Apache의 포트 번호를 렌더(Render) 환경 표준 규격인 80포트로 락인
EXPOSE 80

# Apache 서버 상시 무료 백그라운드 가동 가드 발동
CMD ["apache2-foreground"]