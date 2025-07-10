#!/usr/bin/env python3

import json
import subprocess
import sys

def run_aws_command(command):
    """AWS CLI 명령 실행"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ 명령 실행 실패: {command}")
            print(f"에러: {result.stderr}")
            return None
        return result.stdout
    except Exception as e:
        print(f"❌ 명령 실행 중 오류: {e}")
        return None

def main():
    DISTRIBUTION_ID = "E1YH7W2565N4LY"
    
    print("🔧 CloudFront SPA 라우팅 문제 해결 중...")
    print(f"📡 Distribution ID: {DISTRIBUTION_ID}")
    
    # 현재 CloudFront 설정 가져오기
    print("📋 현재 CloudFront 설정 가져오는 중...")
    config_output = run_aws_command(f"aws cloudfront get-distribution-config --id {DISTRIBUTION_ID}")
    
    if not config_output:
        print("❌ CloudFront 설정을 가져오는데 실패했습니다.")
        sys.exit(1)
    
    try:
        config_data = json.loads(config_output)
        etag = config_data['ETag']
        distribution_config = config_data['DistributionConfig']
        
        print(f"📌 ETag: {etag}")
        
        # 에러 페이지 설정 추가
        print("🔧 에러 페이지 설정 추가 중...")
        distribution_config['CustomErrorResponses'] = {
            'Quantity': 2,
            'Items': [
                {
                    'ErrorCode': 403,
                    'ResponsePagePath': '/index.html',
                    'ResponseCode': '200',
                    'ErrorCachingMinTTL': 300
                },
                {
                    'ErrorCode': 404,
                    'ResponsePagePath': '/index.html',
                    'ResponseCode': '200', 
                    'ErrorCachingMinTTL': 300
                }
            ]
        }
        
        # 설정 파일로 저장
        with open('updated-distribution-config.json', 'w') as f:
            json.dump(distribution_config, f, indent=2)
        
        print("✅ 새로운 설정 생성 완료")
        
        # CloudFront 배포 업데이트
        print("🚀 CloudFront 배포 업데이트 중...")
        update_command = f"aws cloudfront update-distribution --id {DISTRIBUTION_ID} --distribution-config file://updated-distribution-config.json --if-match {etag}"
        
        update_result = run_aws_command(update_command)
        
        if update_result:
            print("✅ CloudFront 설정 업데이트 성공!")
            print("⏳ 배포 완료까지 5-15분 정도 소요됩니다.")
            print("")
            print("📋 설정된 에러 페이지:")
            print("  - 403 Forbidden → /index.html (200)")
            print("  - 404 Not Found → /index.html (200)")
            print("")
            print("🔍 배포 상태 확인:")
            print(f"aws cloudfront get-distribution --id {DISTRIBUTION_ID} --query 'Distribution.Status'")
            print("")
            print("🎉 SPA 라우팅 문제 해결 완료!")
            print("💡 이제 새로고침해도 Access Denied 에러가 발생하지 않습니다.")
        else:
            print("❌ CloudFront 설정 업데이트 실패")
            sys.exit(1)
            
    except json.JSONDecodeError as e:
        print(f"❌ JSON 파싱 오류: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
