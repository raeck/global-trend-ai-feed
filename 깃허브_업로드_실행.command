#!/bin/bash
cd "/Users/kakaoent/Documents/posting" || exit 1
clear
echo "=========================================================="
echo "   🚀 GitHub 저장소로 코드 푸시 (raeck/global-trend-ai-feed)"
echo "=========================================================="
echo "로컬 커밋 내역을 개인 GitHub 저장소로 업로드합니다..."
echo ""
git push origin main
echo ""
echo "=========================================================="
read -p "작업 완료 후 창을 닫으려면 Enter 키를 누르세요..."
